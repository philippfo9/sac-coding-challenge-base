import {NextRouter} from "next/dist/client/router";

type stringOrUndefined = string | undefined

export function isActive(router: NextRouter, ...urls: stringOrUndefined[]): boolean {
  if (!urls) {
    return false;
  }

  let routerPath = router.pathname.trim().replace(/\//g, '');
  routerPath = routerPath.replace(/\[.*]/, '')
  for (const url of urls) {
    if (!url) {
      return false;
    }
    let newUrl = url.trim().replace(/\//g, '');
    //console.log('router: "' + routerPath + '"; str: "' + newUrl + '"')
    if (routerPath === newUrl) {
      return true;
    }
  }
  return false;
}
