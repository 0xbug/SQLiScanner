/**
 * Created by orange on 16/8/7.
 */
const ApiUrl = '/api';

const ScanSQLi = `${ApiUrl}/tasks/sqliscan/?format=json`;
const VulnsScanSQLi = `${ApiUrl}/tasks/sqliscan/?vulnerable=2`;

const UploadHarFile = `${ApiUrl}/har/upload`;
const TasksStat = `${ApiUrl}/tasks/stat/sqli`;

export {
    ApiUrl as default,
    ScanSQLi,
    VulnsScanSQLi,
    UploadHarFile,
    TasksStat,
};