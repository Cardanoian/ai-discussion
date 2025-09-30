import { RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '@radix-ui/react-label';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';

import {
  avatarCustomizations,
  avatarStyles,
  type AvatarCustomization,
  type AvatarStyle,
} from '@/types/avatar';
import { useProfileViewModel } from '@/viewmodels/ProfileViewModel';

const ProfileChangeModal = () => {
  const {
    // State
    newNickname,
    selectedAvatarStyle,
    selectedCustomization,
    previewAvatarUrl,
    isGeneratingAvatar,
    isGeneratingPreview,

    // Setter
    setNewNickname,
    setSelectedAvatarStyle,
    setSelectedCustomization,

    // Handler
    generateAvatarPreview,
    regenerateAvatar,
    handleModalCancel,
    handleProfileSave,
  } = useProfileViewModel();
  return (
    <DialogContent className='sm:max-w-[640px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-white/20'>
      <DialogHeader>
        <DialogTitle className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600'>
          프로필 편집
        </DialogTitle>
        <DialogDescription>
          프로필 이름과 AI 아바타를 설정할 수 있습니다.
        </DialogDescription>
      </DialogHeader>
      <div className='grid gap-6 py-4'>
        {/* 닉네임 입력 */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label htmlFor='displayname' className='text-right'>
            표시명
          </Label>
          <Input
            id='displayname'
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
            className='col-span-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'
            placeholder='표시명을 입력하세요'
            maxLength={20}
          />
        </div>

        {/* 구분선 */}
        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t border-gray-300 dark:border-gray-700' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-white dark:bg-slate-900 px-2 text-gray-500 dark:text-gray-400'>
              AI 아바타 생성
            </span>
          </div>
        </div>

        {/* 아바타 스타일 선택 */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label className='text-right'>스타일</Label>
          <Select
            value={selectedAvatarStyle}
            onValueChange={(value: AvatarStyle) => {
              setSelectedAvatarStyle(value);
            }}
          >
            <SelectTrigger className='col-span-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'>
              <SelectValue placeholder='아바타 스타일 선택' />
            </SelectTrigger>
            <SelectContent className='max-h-60'>
              {avatarStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  <span className='flex flex-col items-start'>
                    <span className='font-medium'>{style.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      {style.description}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 커스터마이징 선택 */}
        <div className='grid grid-cols-4 items-center gap-4'>
          <Label className='text-right'>동물</Label>
          <Select
            value={selectedCustomization}
            onValueChange={(value: AvatarCustomization) => {
              setSelectedCustomization(value);
            }}
          >
            <SelectTrigger className='col-span-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/20'>
              <SelectValue placeholder='동물 캐릭터 선택' />
            </SelectTrigger>
            <SelectContent className='max-h-60'>
              {avatarCustomizations.map((custom) => (
                <SelectItem key={custom.id} value={custom.id}>
                  {custom.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 생성 버튼 */}
        <div className='flex justify-center'>
          <Button
            type='button'
            onClick={generateAvatarPreview}
            disabled={isGeneratingPreview}
            variant='outline'
            className='bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700'
          >
            {isGeneratingPreview ? (
              <>
                <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className='w-4 h-4 mr-2' />
                아바타 미리보기 생성
              </>
            )}
          </Button>
        </div>

        {/* 아바타 미리보기 */}
        {previewAvatarUrl && (
          <div className='flex flex-col items-center gap-4'>
            <div className='relative group'>
              <img
                src={previewAvatarUrl}
                alt='Avatar Preview'
                className='w-32 h-32 rounded-full shadow-lg border-2 border-gray-200 dark:border-gray-700'
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={regenerateAvatar}
                disabled={isGeneratingPreview}
                className='absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg hover:scale-110 transition-transform'
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    isGeneratingPreview ? 'animate-spin' : ''
                  }`}
                />
              </Button>
            </div>
            <p className='text-sm text-muted-foreground'>
              <RefreshCw className='inline w-3 h-3 mr-1' />
              버튼을 눌러 다시 생성하거나 스타일/동물을 바꾸고 생성하세요
            </p>
          </div>
        )}
      </div>
      <DialogFooter className='gap-2'>
        <Button type='button' variant='outline' onClick={handleModalCancel}>
          취소
        </Button>
        <Button
          type='submit'
          onClick={handleProfileSave}
          disabled={isGeneratingAvatar}
          className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0'
        >
          {isGeneratingAvatar ? (
            <>
              <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
              저장 중...
            </>
          ) : (
            <>
              <Sparkles className='w-4 h-4 mr-2' />
              설정 저장
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default ProfileChangeModal;
