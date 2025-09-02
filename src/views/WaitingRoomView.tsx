import RoomListView from './RoomListView';
import { useNavigate } from 'react-router-dom';

const WaitingRoomView = () => {
  const navigate = useNavigate();

  const handleBattleStart = () => {
    // Navigate to discussion view when battle starts
    navigate('/discussion');
  };

  return <RoomListView onBattleStart={handleBattleStart} />;
};

export default WaitingRoomView;
