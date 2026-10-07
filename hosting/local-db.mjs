// Local development adapter for the same prepared statements used by D1.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
export function localDatabase(filename=':memory:') {
  const sqlite=new DatabaseSync(filename);sqlite.exec('PRAGMA foreign_keys=ON');
  sqlite.exec('CREATE TABLE IF NOT EXISTS local_migrations(name TEXT PRIMARY KEY)');
  for(const name of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())if(!sqlite.prepare('SELECT name FROM local_migrations WHERE name=?').get(name)){
    sqlite.exec(readFileSync('drizzle/'+name,'utf8'));sqlite.prepare('INSERT INTO local_migrations(name) VALUES(?)').run(name);
  }
  const DB={prepare(sql){let values=[];return {bind(...v){values=v;return this;},async first(){return sqlite.prepare(sql).get(...values)||null;},async all(){return {results:sqlite.prepare(sql).all(...values)};},async run(){return {meta:sqlite.prepare(sql).run(...values)};},_run(){return sqlite.prepare(sql).run(...values);}};},async batch(items){sqlite.exec('BEGIN IMMEDIATE');try{const result=items.map(x=>({meta:x._run()}));sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}},close(){sqlite.close();}};
  return DB;
}
