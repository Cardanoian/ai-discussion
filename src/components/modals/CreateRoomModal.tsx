import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import type { Subject } from '@/models/Room';

interface CreateRoomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  onCreateRoom: () => void;
  isCreatingRoom?: boolean;
}

const CreateRoomModal = ({
  isOpen,
  onOpenChange,
  subjects,
  selectedSubject,
  onSubjectChange,
  onCreateRoom,
  isCreatingRoom = false,
}: CreateRoomModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group px-8 py-3'>
          <Plus className='w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300' />
          방 만들기
        </Button>
      </DialogTrigger>
      <DialogContent
        className='sm:max-w-[600px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'>
            새 토론방 만들기
          </DialogTitle>
          <DialogDescription>토론할 주제를 선택해주세요.</DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='subject' className='text-right font-medium'>
              주제
            </Label>
            <div className='col-span-3'>
              <Select value={selectedSubject} onValueChange={onSubjectChange}>
                <SelectTrigger className='bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'>
                  <SelectValue placeholder='주제를 선택하세요' />
                </SelectTrigger>
                <SelectContent className='bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.uuid} value={subject.uuid}>
                      {subject.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            onClick={() => onOpenChange(false)}
            className='bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transition-all duration-300 mr-2'
          >
            취소
          </Button>
          <Button
            type='submit'
            onClick={onCreateRoom}
            disabled={!selectedSubject || isCreatingRoom}
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
          >
            {isCreatingRoom ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                생성 중...
              </>
            ) : (
              '방 만들기'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;
