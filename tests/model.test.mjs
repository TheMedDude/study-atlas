import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffle, completeResponse, scoreActivity, conceptEvidence, progressSummary, selectActivities, examResult, formatTime } from '../app/model.js';

const mcq = (id, concepts = ['c1']) => ({ id, revision:1, type:'mcq', status:'validated', lectureId:'l1', conceptIds:concepts, options:['a','b','c','d','e'].map(id=>({id})), correctOptionId:'a' });
const bank = [mcq('q1'), mcq('q2'), mcq('q3'), mcq('q4'), mcq('q5'), mcq('q6',['c2'])];
const attempt = (id, correct, n = 0, extra = {}) => ({ id:`attempt-${id}-${n}`,activityId:id,revision:1,at:new Date(Date.UTC(2026,0,1,0,n)).toISOString(),correct,...extra });

test('shuffling preserves items, input, and length', () => {
  const input = ['a','b','c','d','e'], result = shuffle(input, () => .2);
  assert.deepEqual([...result].sort(), input); assert.deepEqual(input,['a','b','c','d','e']); assert.notDeepEqual(result,input);
});
test('MCQ scoring rejects missing/unknown answers', () => {
  assert.equal(scoreActivity(bank[0],'a'),true); assert.equal(scoreActivity(bank[0],'b'),false);
  assert.equal(completeResponse(bank[0],'z'),false); assert.equal(scoreActivity(bank[0],undefined),false);
});
test('matching requires a complete bijection and accepts only the source pairs', () => {
  const a={type:'match',pairs:[{id:'p1'},{id:'p2'},{id:'p3'}]};
  assert.equal(scoreActivity(a,{p1:'p1',p2:'p2',p3:'p3'}),true);
  assert.equal(scoreActivity(a,{p1:'p2',p2:'p1',p3:'p3'}),false);
  assert.equal(completeResponse(a,{p1:'p1',p2:'p1',p3:'p3'}),false);
  assert.equal(completeResponse(a,{p1:'p1'}),false);
});
test('ordering accepts interchangeable members of an explicit group', () => {
  const a={type:'order',items:['a','b','c','d'].map(id=>({id})),acceptedGroups:[['a'],['b','c'],['d']]};
  assert.equal(scoreActivity(a,['a','b','c','d']),true); assert.equal(scoreActivity(a,['a','c','b','d']),true);
  assert.equal(scoreActivity(a,['b','a','c','d']),false); assert.equal(scoreActivity(a,['a','b','b','d']),false);
});
test('repeating one item never increases distinct evidence', () => {
  const attempts=Array.from({length:10},(_,n)=>attempt('q1',true,n));
  assert.equal(conceptEvidence('c1',attempts,bank).distinct,1);
  assert.equal(conceptEvidence('c1',attempts,bank).state,'limited');
});
test('latest attempt per distinct item determines performance', () => {
  const attempts=[attempt('q1',false,0),attempt('q1',true,1),attempt('q2',true,2),attempt('q3',true,3)];
  const e=conceptEvidence('c1',attempts,bank); assert.equal(e.distinct,3); assert.equal(e.accuracy,1); assert.equal(e.state,'consistent');
});
test('recent error prevents a consistent label even with 80% accuracy', () => {
  const attempts=bank.slice(0,5).map((a,n)=>attempt(a.id,n!==4,n));
  const e=conceptEvidence('c1',attempts,bank); assert.equal(e.accuracy,.8); assert.equal(e.state,'inconsistent');
});
test('older error with three distinct recent correct items permits consistent performance', () => {
  const attempts=bank.slice(0,5).map((a,n)=>attempt(a.id,n!==0,n));
  assert.equal(conceptEvidence('c1',attempts,bank).state,'consistent');
});
test('obsolete revisions and duplicate attempt IDs do not add evidence', () => {
  const a=attempt('q1',true); const attempts=[a,{...a},attempt('q2',true,1,{revision:2})];
  assert.equal(conceptEvidence('c1',attempts,bank).distinct,1);
});
test('coverage includes concepts with no activities and stays separate from accuracy', () => {
  const concepts=[{id:'c1'},{id:'c2'},{id:'unavailable'}], s=progressSummary(concepts,[attempt('q1',false)],bank);
  assert.equal(s.total,3); assert.equal(s.encountered,1); assert.equal(s.available,2); assert.equal(s.counts.untested,2); assert.equal(s.counts.limited,1);
});
test('selection respects type/chapter/concept/exclusion/count and never mutates the bank', () => {
  const original=bank.map(a=>a.id);
  const result=selectActivities(bank,[{id:'c1',priority:'core'},{id:'c2',priority:'core'}],[],{count:20,conceptIds:['c1'],excludeIds:['q1'],lectureIds:['l1'],random:()=>.2});
  assert.equal(result.length,4); assert.ok(result.every(a=>a.id!=='q1'&&a.conceptIds.includes('c1'))); assert.deepEqual(bank.map(a=>a.id),original);
});
test('a missed concept is selected before an otherwise comparable untested one', () => {
  const result=selectActivities(bank,[{id:'c1',priority:'core'},{id:'c2',priority:'core'}],[attempt('q6',false)],{count:1,random:()=>.2});
  assert.equal(result[0].id,'q6');
});
test('a weak concept uses a different available variant before repeating the latest item', () => {
  const items=[mcq('q1'),mcq('q2')];
  const next=selectActivities(items,[{id:'c1',priority:'core'}],[attempt('q1',false)],{count:1,random:()=>0});
  assert.equal(next[0].id,'q2');
});
test('exam results keep unanswered items distinct while including them in the fixed set', () => {
  const result=examResult(bank.slice(0,3),{q1:'a',q2:'b'});
  assert.equal(result.length,3); assert.equal(result.filter(r=>r.correct).length,1); assert.equal(result.filter(r=>!r.answered).length,1);
  assert.equal(result[2].response,null);
});
test('timer display cannot become negative',()=> {assert.equal(formatTime(-1),'00:00');assert.equal(formatTime(61),'01:01');});
