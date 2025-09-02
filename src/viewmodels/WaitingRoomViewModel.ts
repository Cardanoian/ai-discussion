import { useNavigate } from 'react-router-dom';

export const useWaitingRoomViewModel = () => {
  const navigate = useNavigate();

  const handleBattleStart = () => {
    // Navigate to discussion view when battle starts
    navigate('/discussion');
  };

  return {
    handleBattleStart,
  };
};
