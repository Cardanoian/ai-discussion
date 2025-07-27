import { Server, Socket } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../supabaseClient';
import { BattleRoom } from '../types/database';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); 

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // @ts-ignore - `thinkingBudget` is not in the type definition but is a valid parameter
    thinkingBudget: false 
});

interface BattleState {
    [roomId: string]: {
        turn: number;
        discussionLog: { userId: string, message: string }[];
        currentPlayerIndex: number;
    };
}

const battleStates: BattleState = {};

const updateUserStats = async (userId: string, won: boolean) => {
    const { data, error } = await supabase
        .from('user_profile')
        .select('wins, loses')
        .eq('user_uuid', userId)
        .single();

    if (error || !data) {
        console.error('Error fetching user stats:', error);
        return;
    }

    const updates = {
        wins: data.wins + (won ? 1 : 0),
        loses: data.loses + (won ? 0 : 1),
    };

    await supabase.from('user_profile').update(updates).eq('user_uuid', userId);
};

export const registerBattleHandlers = (io: Server, socket: Socket) => {
    socket.on('start_battle_logic', async (room: BattleRoom) => {
        const { roomId } = room;
        io.to(roomId).emit('battle_info', '대전 시작! 사용자 정보를 가져오는 중...');

        try {
            const player1Id = room.players[0].userId;
            const player2Id = room.players[1].userId;

            const [player1Doc, player2Doc] = await Promise.all([
                supabase.from('docs').select('*').eq('user_uuid', player1Id).eq('subject_id', room.subject!.uuid).single(),
                supabase.from('docs').select('*').eq('user_uuid', player2Id).eq('subject_id', room.subject!.uuid).single()
            ]);

            io.to(roomId).emit('battle_info', '주사위를 굴려 순서를 정합니다...');
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;

            let firstPlayerIndex = dice1 >= dice2 ? 0 : 1;
            let secondPlayerIndex = 1 - firstPlayerIndex;

            battleStates[roomId] = {
                turn: 0,
                discussionLog: [],
                currentPlayerIndex: firstPlayerIndex,
            };

            const firstPlayer = room.players[firstPlayerIndex];
            io.to(roomId).emit('battle_info', `주사위 결과: ${room.players[0].userId} - ${dice1}, ${room.players[1].userId} - ${dice2}.`);
            io.to(roomId).emit('turn_info', {
                currentPlayerId: firstPlayer.userId,
                turn: 0,
                message: `${firstPlayer.userId}님이 먼저 의견을 제시합니다.`
            });

        } catch (error) {
            io.to(roomId).emit('battle_error', '대전 시작 중 오류가 발생했습니다.');
            console.error(error);
        }
    });

    socket.on('send_message', async ({ roomId, userId, message }: { roomId: string, userId: string, message: string }) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room) return;

        const state = battleStates[roomId];
        if (!state) return;
        
        const playerInfo = (io.sockets.adapter.rooms.get(roomId) as any)?.players.find((p:any) => p.userId === userId);
        if (!playerInfo) return;

        state.discussionLog.push({ userId, message });
        io.to(roomId).emit('new_message', { userId, message });

        state.turn++;
        state.currentPlayerIndex = 1 - state.currentPlayerIndex;
        const nextPlayer = (io.sockets.adapter.rooms.get(roomId) as any).players[state.currentPlayerIndex];

        if (state.turn < 6) { // 3 turns for each player
             io.to(roomId).emit('turn_info', {
                currentPlayerId: nextPlayer.userId,
                turn: state.turn,
                message: `다음은 ${nextPlayer.userId}님의 차례입니다.`
            });
        } else {
            io.to(roomId).emit('battle_info', '토론이 종료되었습니다. AI가 채점을 시작합니다.');
            
            const prompt = `
                다음은 두 사용자의 토론 내용입니다.
                주제: ${(io.sockets.adapter.rooms.get(roomId) as any).subject.title}
                토론 내용:
                ${state.discussionLog.map(log => `${log.userId}: ${log.message}`).join('\n')}

                각 사용자의 주장에 대해 논리성, 근거의 타당성, 설득력을 기준으로 0점에서 100점 사이로 채점하고, 각 항목에 대한 구체적인 피드백을 제공해주세요.
                최종적으로 누가 더 설득력 있었는지 결론을 내리고, 승자를 정해주세요.
                출력 형식은 다음과 같은 JSON 객체로 만들어주세요:
                {
                  "scores": {
                    "player1_id": "...",
                    "player1_score": ...,
                    "player2_id": "...",
                    "player2_score": ...
                  },
                  "feedback": {
                    "player1": "...",
                    "player2": "..."
                  },
                  "winner": "player1_id or player2_id"
                }
            `;

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();
                const resultJson = JSON.parse(text.replace(/```json|```/g, '').trim());

                io.to(roomId).emit('battle_result', resultJson);

                const winnerId = resultJson.winner;
                const loserId = (io.sockets.adapter.rooms.get(roomId) as any).players.find((p:any) => p.userId !== winnerId)?.userId;

                if(winnerId && loserId) {
                    await updateUserStats(winnerId, true);
                    await updateUserStats(loserId, false);
                }

                // Clean up
                delete battleStates[roomId];

            } catch (e) {
                console.error("Error with Gemini API:", e);
                io.to(roomId).emit('battle_error', 'AI 채점 중 오류가 발생했습니다.');
            }
        }
    });
};