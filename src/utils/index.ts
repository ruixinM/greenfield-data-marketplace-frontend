import { format, utcToZonedTime } from 'date-fns-tz';
import ReactDOM from 'react-dom';
import BN from 'bn.js';
import Identicon from 'identicon.js';
import sha265 from 'sha256';
import { toast } from '@totejs/uikit';

import axios, { AxiosResponse } from 'axios';
import { IRawSPInfo } from './type';
import { getSpOffChainData } from './off-chain-auth/utils';
import { getDomain } from './getDomain';
import { generateGetObjectOptions } from './generateGetObjectOptions';
import { IReturnOffChainAuthKeyPairAndUpload } from '@bnb-chain/greenfield-chain-sdk';
import { getUtcZeroTimestamp } from './time';

// import ProgressBarToast from '../components/ProgressBarToast';

export const trimLongStr = (
  str: string,
  maxLength = 14,
  headLen = 4,
  footLen = 8,
) => {
  if (!str) {
    return '';
  }
  if (str.length > maxLength) {
    const head = str.substring(0, headLen);
    const foot = str.substring(str.length - footLen, str.length);
    return `${head}...${foot}`;
  }
  return str;
};

// const formatStr = "MMM-dd-yyyy hh:mm:ss aa '+UTC'";
const formatStr = 'MMM-dd-yyyy';

export const formatDateUTC = (date: number | string) => {
  const numDate = Number(date);
  const zonedTime = utcToZonedTime(numDate, 'UTC');
  return format(zonedTime, formatStr, { timeZone: 'UTC' });
};

export const batchUpdate = (fn: () => void) => {
  ReactDOM.unstable_batchedUpdates(fn);
};

export const delay = (s: number) => {
  return new Promise((res) => {
    setTimeout(() => {
      res(true);
    }, s * 1000);
  });
};

export const removeTrailingZero = (str: string) => {
  return str.replace(/0+$/, '');
};

/**
 * divide BN with 10^n
 * for example:
 * divide10Exp(123456789, 3) => 123456.789
 * @param origin
 * @param pow
 */
const ZERO = new BN(0);
export const divide10Exp = (origin: BN, pow: number) => {
  if (origin.eq(ZERO)) {
    return '0';
  }
  const divisor = new BN(10).pow(new BN(pow));
  if (origin.lt(divisor)) {
    const str = origin.toString(10, pow);
    return '0.' + removeTrailingZero(str);
  } else {
    const mod = origin.mod(divisor);
    const intPartStr = origin.div(divisor).toString();
    if (mod.eq(ZERO)) {
      return intPartStr;
    } else {
      return intPartStr + '.' + removeTrailingZero(mod.toString(10, pow));
    }
  }
};

export const generateGroupName = (bucketName: string, objName?: string) => {
  if (objName) {
    return `dm_o_${bucketName}_${objName}`;
  } else {
    return `dm_b_${bucketName}`;
  }
};

export const parseGroupName = (groupName: string) => {
  let name = groupName;
  let type = 'Collection';
  let bucketName = '';
  if (name.indexOf('dm_') === 0) {
    if (name.indexOf('dm_o_') === 0) {
      type = 'Data';
    }
    const temp = name.split('_');
    name = temp.slice(-1)[0];
    bucketName = temp[2];
  }
  return {
    type,
    name,
    bucketName,
  };
};

export const defaultImg = (name: string, width: number) => {
  if (!name) return '';
  const sha = sha265(name);
  const dataBase = new Identicon(sha, width).toString();
  return `data:image/png;base64,${dataBase}`;
};

export const parseFileSize = (size: number) => {
  const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let index = 0;
  index = Math.floor(Math.log(size) / Math.log(1024));
  const _size = size / Math.pow(1024, index);
  return _size.toFixed(2) + unitArr[index];
};

const getFileExtension = (filename: string): string | undefined => {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex > 0 && dotIndex < filename.length - 1) {
    return filename.substring(dotIndex + 1).toUpperCase();
  } else {
    return '';
  }
};

export const contentTypeToExtension = (contentType = '', fileName?: string) => {
  if (fileName?.endsWith('/')) return 'FOLDER';
  switch (contentType) {
    case 'image/jpeg':
      return 'JPG';
    case 'image/png':
      return 'PNG';
    case 'image/gif':
      return 'GIF';
    case 'application/pdf':
      return 'PDF';
    case 'application/msword':
      return 'DOC';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    case 'application/vnd.ms-excel':
      return 'XLS';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return 'XLSX';
    case 'text/plain':
      return 'TXT';
    case 'application/zip':
      return 'ZIP';
    case 'application/octet-stream':
      return 'Document';
    default:
      if (fileName && fileName.length > 0) {
        const fileExtension = getFileExtension(fileName);
        return fileExtension ? fileExtension : contentType;
      }
      return contentType;
  }
};

export const downloadWithProgress = async ({
  bucketName,
  objectName,
  primarySp,
  payloadSize,
  address,
}: {
  bucketName: string;
  objectName: string;
  primarySp: IRawSPInfo;
  payloadSize: number;
  address: string;
}) => {
  try {
    const domain = getDomain();
    const { seedString } = await getSpOffChainData({
      address,
      spAddress: primarySp.operatorAddress,
    });
    const uploadOptions = await generateGetObjectOptions({
      bucketName,
      objectName,
      endpoint: primarySp.endpoint,
      userAddress: address,
      domain,
      seedString,
    });
    const { url, headers } = uploadOptions;
    // const toastId = toast.info({
    //   description: ``,
    //   render: (props: any) => {
    //     return (
    //       <ProgressBarToast
    //         progress={0}
    //         fileName={objectName}
    //         closeToast={() => {
    //           toast.close(toastId);
    //         }}
    //       />
    //     );
    //   },
    //   duration: -1,
    // });
    const result = await axios
      .get(url, {
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / payloadSize) * 100,
          );
          // toast.update(toastId, {
          //   description: ``,
          //   render: () => {
          //     return (
          //       <ProgressBarToast
          //         progress={progress}
          //         fileName={objectName}
          //         closeToast={() => {
          //           toast.close(toastId);
          //         }}
          //       />
          //     );
          //   },
          // });
          console.log(progress);
        },
        headers: {
          Authorization: headers.get('Authorization'),
          'X-Gnfd-User-Address': headers.get('X-Gnfd-User-Address'),
          'X-Gnfd-App-Domain': headers.get('X-Gnfd-App-Domain'),
        },
        responseType: 'blob',
      })
      .catch((e) => {
        // toast.close(toastId);
        throw e;
      });
    // toast.close(toastId);
    return result;
  } catch (error: any) {
    throw error;
  }
};

export const directlyDownload = (url: string) => {
  if (!url) {
    toast.error({
      description: 'Download url not existed. Please check.',
    });
  }
  const link = document.createElement('a');
  link.href = url;
  link.download = '';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const truncateFileName = (fileName: string) => {
  if (!fileName || fileName.length === 0) return '';
  const maxFileNameLength = 25;
  const fileExtension = fileName.slice(fileName.lastIndexOf('.'));
  const fileNameWithoutExtension = fileName.slice(0, fileName.lastIndexOf('.'));
  const truncatedFileNameLength = maxFileNameLength - fileExtension.length - 4;
  if (fileName.length <= maxFileNameLength) {
    return fileName;
  }
  return `${fileNameWithoutExtension.slice(
    0,
    truncatedFileNameLength,
  )}...${fileNameWithoutExtension.slice(-4)}${fileExtension}`;
};

export const encodeObjectName = (obj: string) => {
  return obj.split('/').map(encodeURIComponent).join('/');
};

export const viewFileByAxiosResponse = (result: AxiosResponse) => {
  try {
    const { data, headers: resultHeaders } = result;
    const blob = new Blob([data], { type: resultHeaders['content-type'] });
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL);
  } catch (error) {
    console.error('view file error', error);
  }
};

export const saveFileByAxiosResponse = (
  result: AxiosResponse,
  objectName: string,
) => {
  try {
    const { data, headers: resultHeaders } = result;
    const blob = new Blob([data], { type: resultHeaders['content-type'] });
    const fileURL = URL.createObjectURL(blob);
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.download = objectName as string;
    fileLink.click();
  } catch (error) {
    console.error('save file error', error);
  }
};

export const checkSpOffChainDataAvailable = (
  spOffChainData: IReturnOffChainAuthKeyPairAndUpload,
) => {
  const curTime = getUtcZeroTimestamp();

  return (
    Object.keys(spOffChainData).length &&
    spOffChainData.expirationTime > curTime
  );
};

export const getRandomStr = (len: number) => {
  len = len || 32;
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const a = t.length;
  let n = '';
  for (let i = 0; i < len; i++) n += t.charAt(Math.floor(Math.random() * a));
  return n;
};

export const getUrlParam = (paraName: string) => {
  const url = document.location.toString();
  const arrObj = url.split('?');
  if (arrObj.length > 1) {
    const arrPara = arrObj[1].split('&');
    let arr;
    for (let i = 0; i < arrPara.length; i++) {
      arr = arrPara[i].split('=');

      if (arr != null && arr[0] == paraName) {
        return arr[1];
      }
    }
    return '';
  } else {
    return '';
  }
};
