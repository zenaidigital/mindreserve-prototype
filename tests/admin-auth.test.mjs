import test from 'node:test';
import assert from 'node:assert/strict';
import {requireAdministrator} from '../src/adminAuth.mjs';
const env={ADMIN_EMAILS:'auditor.review@zenaidigital.com',ADMIN_ACCESS_KEY:'legacy-test-key'};
const request={headers:{authorization:'Bearer signed-token'}};
const deps=(record,token={uid:'review-user'})=>({env,verify:async()=>token,lookup:async()=>record});
test('configured administrator is allowed',async()=>{
 await requireAdministrator(request,deps({uid:'review-user',email:env.ADMIN_EMAILS,disabled:false}));
});
test('current account email overrides stale or forged token claims',async()=>{
 await assert.rejects(requireAdministrator(request,deps({uid:'review-user',email:'auditor.business@zenaidigital.com'}, {uid:'review-user',email:env.ADMIN_EMAILS})),{status:403});
});
test('expired, disabled and mismatching identities are denied',async()=>{
 await assert.rejects(requireAdministrator(request,deps({},null)),{status:401});
 await assert.rejects(requireAdministrator(request,deps({uid:'review-user',email:env.ADMIN_EMAILS,disabled:true})),{status:403});
 await assert.rejects(requireAdministrator(request,deps({uid:'another-user',email:env.ADMIN_EMAILS})),{status:403});
});
test('configuration and lookup failure fail closed',async()=>{
 await assert.rejects(requireAdministrator(request,{...deps({}),env:{}}),{status:503});
 await assert.rejects(requireAdministrator(request,{...deps({}),lookup:async()=>{throw Error('Unavailable');}}),{status:503});
});
test('legacy key cannot bypass an invalid bearer',async()=>{
 await requireAdministrator({headers:{'x-admin-key':'legacy-test-key'}},{env});
 await assert.rejects(requireAdministrator({headers:{'x-admin-key':'wrong'}},{env}),{status:401});
 await assert.rejects(requireAdministrator({headers:{authorization:'Bearer expired','x-admin-key':'legacy-test-key'}},deps({},null)),{status:401});
});
