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
import { Settings } from 'lucide-react';
import type { Subject } from '@/models/Room';

interface ChangeSubjectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  selectedSubject: string;
  onSubjectChange: (value: string) => void;
  onChangeSubject: () => void;
}

const ChangeSubjectModal = ({
  isOpen,
  onOpenChange,
  subjects,
  selectedSubject,
  onSubjectChange,
  onChangeSubject,
}: ChangeSubjectModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size='sm'
          className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
        >
          <Settings className='w-4 h-4 mr-2' />
          주제 변경
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
        <DialogHeader>
          <DialogTitle className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'>
            토론 주제 변경
          </DialogTitle>
          <DialogDescription>
            새로운 토론 주제를 선택해주세요.
          </DialogDescription>
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
            type='submit'
            onClick={onChangeSubject}
            disabled={!selectedSubject}
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
          >
            주제 변경
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeSubjectModal;
