import { ErrorMessage, StatusCodeAction } from './types';
export declare const generateGlobalArrayWithOverrides: (globalArray: (StatusCodeAction | ErrorMessage)[], endpointArray: (StatusCodeAction | ErrorMessage)[]) => (StatusCodeAction | ErrorMessage)[];
