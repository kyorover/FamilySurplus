// src/functions/authErrorHandler.ts
export const getJapaneseErrorMessage = (error: any): string => {
  const code = error.name || error.code;
  
  if (code === 'InvalidPasswordException' || (error.message && error.message.includes('Password did not conform'))) {
    return 'パスワードの強度が不足しています。\n8文字以上で、大文字・小文字・数字・特殊記号（!@#$等）を含めてください。';
  }
  if (code === 'UsernameExistsException') return 'このメールアドレスは既に登録されています。';
  if (code === 'UserNotFoundException') return '登録されていないメールアドレスです。';
  if (code === 'NotAuthorizedException') return 'メールアドレスまたはパスワードが間違っています。';
  if (code === 'CodeMismatchException') return '確認コードが間違っています。';
  if (code === 'ExpiredCodeException') return '確認コードの有効期限が切れています。再度登録からやり直してください。';
  if (code === 'TooManyRequestsException' || code === 'LimitExceededException') {
    return '試行回数が多すぎます。しばらく時間をおいてから再度お試しください。';
  }
  if (code === 'InvalidParameterException' && error.message?.includes('email')) {
    return 'メールアドレスの形式が正しくありません。';
  }
  
  return 'エラーが発生しました。入力内容をご確認ください。';
};