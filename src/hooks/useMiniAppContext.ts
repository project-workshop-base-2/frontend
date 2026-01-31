import { useMiniKit } from '@coinbase/onchainkit/minikit';

export function useMiniAppContext() {
  const { context } = useMiniKit();

  const isInMiniApp = !!context;
  const userInfo = context?.user ? {
    fid: context.user.fid,
    username: context.user.username,
    displayName: context.user.displayName,
    pfpUrl: context.user.pfpUrl,
  } : null;

  return {
    isInMiniApp,
    userInfo,
    context,
  };
}
