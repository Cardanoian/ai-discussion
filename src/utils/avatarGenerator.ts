import { supabase } from '@/lib/supabaseClient';
import { avatarStyles, type AvatarStyle } from '@/types/avatar';
import printDev from '@/utils/printDev';

interface GenerateAvatarOptions {
  style: AvatarStyle;
  customization: string; // 사용자 커스터마이징 (성별, 특징 등)
}

/**
 * Google Gemini Imagen API를 사용하여 아바타 생성
 */
export async function generateAvatarWithGemini({
  style,
  customization,
}: GenerateAvatarOptions): Promise<Blob> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('Google API key is not configured');
    }

    // 선택한 스타일 찾기
    const selectedStyle = avatarStyles.find((s) => s.id === style);
    if (!selectedStyle) {
      throw new Error(`Invalid avatar style: ${style}`);
    }

    // 프롬프트 구성 (customization으로 {character}를 대체)
    const prompt = `${selectedStyle.prompt.replace(
      '{character}',
      customization
    )}, square aspect ratio, centered composition, professional avatar for social media profile, no text, no watermark`;

    printDev.log('Generating avatar with prompt:', prompt);

    // Imagen API 호출
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: '1:1',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      printDev.error('Imagen API Error:', errorText);
      throw new Error(`Failed to generate avatar: ${response.statusText}`);
    }

    const data = await response.json();
    printDev.log('Imagen API Response:', data);
    printDev.log(
      'Predictions structure:',
      JSON.stringify(data.predictions?.[0], null, 2)
    );

    // 이미지 데이터 추출 - Imagen API 응답 구조에 맞게 수정
    if (data.predictions && data.predictions[0]) {
      const prediction = data.predictions[0];

      // Base64 데이터를 Blob으로 변환
      let base64Data: string;

      // 다양한 응답 구조 처리
      if (prediction.bytesBase64Encoded) {
        base64Data = prediction.bytesBase64Encoded;
      } else if (prediction.image?.bytesBase64Encoded) {
        base64Data = prediction.image.bytesBase64Encoded;
      } else if (prediction.image?.imageBytes) {
        base64Data = prediction.image.imageBytes;
      } else if (typeof prediction === 'string') {
        // 직접 base64 문자열인 경우
        base64Data = prediction;
      } else {
        printDev.error('Unexpected response structure:', prediction);
        throw new Error('Unable to extract image data from response');
      }

      // Base64를 Blob으로 변환
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: 'image/png',
      });

      return blob;
    } else {
      throw new Error('No predictions in response');
    }
  } catch (error) {
    printDev.error('Error generating avatar with Gemini:', error);
    throw error;
  }
}

/**
 * 미리보기용 URL 생성 (Blob을 URL로 변환)
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Supabase Storage에 아바타 업로드
 */
export async function uploadAvatarToStorage(
  userId: string,
  blob: Blob
): Promise<string> {
  try {
    const fileName = `${userId}_${Date.now()}.png`;

    // Storage 버킷 확인 및 생성
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarsBucket = buckets?.find((b) => b.name === 'avatar_img');

    if (!avatarsBucket) {
      printDev.log('Creating avatar_img bucket...');
      const { error: createError } = await supabase.storage.createBucket(
        'avatar_img',
        {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml'],
        }
      );

      if (createError) {
        printDev.error('Error creating bucket:', createError);
        throw createError;
      }
    }

    // 이전 아바타 삭제 (있는 경우)
    const { data: existingFiles } = await supabase.storage
      .from('avatar_img')
      .list('', {
        search: userId,
      });

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((f) => f.name);
      await supabase.storage.from('avatar_img').remove(filesToDelete);
    }

    // 새 아바타 업로드
    const { error: uploadError } = await supabase.storage
      .from('avatar_img')
      .upload(fileName, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      printDev.error('Error uploading avatar:', uploadError);
      throw uploadError;
    }

    // Public URL 가져오기
    const { data: urlData } = supabase.storage
      .from('avatar_img')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    printDev.error('Error in uploadAvatarToStorage:', error);
    throw error;
  }
}

/**
 * 아바타 생성, 업로드 및 프로필 업데이트 통합 함수
 */
export async function createAndUploadAvatar(
  userId: string,
  style: AvatarStyle,
  customization: string
): Promise<string> {
  try {
    printDev.log('Generating avatar...', {
      style,
      customization,
    });

    // 1. Gemini로 이미지 생성
    const blob = await generateAvatarWithGemini({
      style,
      customization,
    });

    // 2. Storage에 업로드
    printDev.log('Uploading to storage...');
    const avatarUrl = await uploadAvatarToStorage(userId, blob);

    printDev.log('Avatar created successfully:', avatarUrl);
    return avatarUrl;
  } catch (error) {
    printDev.error('Error creating and uploading avatar:', error);
    throw error;
  }
}
