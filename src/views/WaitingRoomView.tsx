import RoomListView from './RoomListView';
import { useWaitingRoomViewModel } from '@/viewmodels/WaitingRoomViewModel';

const WaitingRoomView = () => {
  const { handleBattleStart } = useWaitingRoomViewModel();

  return <RoomListView onBattleStart={handleBattleStart} />;
};

export default WaitingRoomView;
