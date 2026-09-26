import pg from 'pg';
const { Client } = pg;

const password = 'Sudo_me@123';
const ref = 'qcakbzzjgnstnrqkxsei';

const regions = [
    'aws-0-ap-south-1.pooler.supabase.com',
    'aws-0-ap-southeast-1.pooler.supabase.com',
    'aws-0-ap-southeast-2.pooler.supabase.com',
    'aws-0-ap-northeast-1.pooler.supabase.com',
    'aws-0-ap-northeast-2.pooler.supabase.com',
    'aws-0-us-east-1.pooler.supabase.com',
    'aws-0-us-east-2.pooler.supabase.com',
    'aws-0-us-west-1.pooler.supabase.com',
    'aws-0-us-west-2.pooler.supabase.com',
    'aws-0-eu-central-1.pooler.supabase.com',
    'aws-0-eu-west-1.pooler.supabase.com',
    'aws-0-eu-west-2.pooler.supabase.com',
    'aws-0-eu-west-3.pooler.supabase.com',
    'aws-0-sa-east-1.pooler.supabase.com',
    'aws-0-ca-central-1.pooler.supabase.com'
];

async function testAll() {
    for (const host of regions) {
        const conn = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:6543/postgres`;
        const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 3000 });
        try {
            await client.connect();
            console.log('🎉 FOUND WORKING POOLER REGION HOST:', host);
            await client.end();
            return { host, conn };
        } catch (e) {
            if (!e.message.includes('tenant/user') && !e.message.includes('ENOTFOUND')) {
                console.log('✨ TENANT MATCHED ON HOST:', host, 'Error:', e.message);
                return { host, conn };
            }
        }
    }
    console.log('Done searching.');
    return null;
}

testAll();
