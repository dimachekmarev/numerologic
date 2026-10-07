// All application data is durable, scoped to an account, and accessed with bound SQL.
export function database(binding) {
  if(!binding) throw Object.assign(new Error('Хранилище временно недоступно'),{status:503});
  const stmt=(sql,...values)=>binding.prepare(sql).bind(...values);
  const one=async(sql,...v)=>stmt(sql,...v).first();
  const all=async(sql,...v)=>(await stmt(sql,...v).all()).results;
  const run=async(sql,...v)=>stmt(sql,...v).run();
  const batch=async(items)=>binding.batch(items.map(([sql,...values])=>stmt(sql,...values)));
  const get=async(owner,kind,key)=>one('SELECT * FROM cloud_records WHERE owner=? AND kind=? AND key=?',owner,kind,String(key));
  const put=async(owner,kind,key,data)=>one('INSERT INTO cloud_records(owner,kind,key,data) VALUES(?,?,?,?) ON CONFLICT(owner,kind,key) DO UPDATE SET data=excluded.data RETURNING *',owner,kind,String(key),JSON.stringify(data));
  const list=async(owner,kind)=>all('SELECT * FROM cloud_records WHERE owner=? AND kind=? ORDER BY id',owner,kind);
  return {one,all,run,batch,get,put,list};
}
