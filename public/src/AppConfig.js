/**
 * Created by orange on 16/8/7.
 */
const ApiUrl = 'http://127.0.0.1:8000/api';

const ScanSQLi = `${ApiUrl}/tasks/sqliscan/?format=json`;
const VulnsScanSQLi = `${ApiUrl}/tasks/sqliscan/?vulnerable=2`;

const UploadHarFile = `${ApiUrl}/har/upload`;

export {
    ApiUrl as default,
    ScanSQLi,
    VulnsScanSQLi,
    UploadHarFile,
};