const fs=require('fs'),path=require('path'),babel=require('../frontend/node_modules/@babel/core');
const exclude=new Set(['Landing.jsx','LanguageSwitch.jsx','Rituals.jsx','Marketing.jsx']);
for(const folder of ['frontend/src/pages','frontend/src/components'])for(const file of fs.readdirSync(folder)){
 if(!file.endsWith('.jsx')||exclude.has(file))continue;
 const filename=path.join(folder,file),input=fs.readFileSync(filename,'utf8');if(input.includes('useI18n'))continue;
 let needed=false;
 const output=babel.transformSync(input,{configFile:false,babelrc:false,parserOpts:{plugins:['jsx']},generatorOpts:{retainLines:false},plugins:[({types:t})=>({visitor:{
 JSXText(p){const value=p.node.value.replace(/\s+/g,' ').trim();if(!/[А-Яа-яЁё]/.test(value))return;needed=true;p.replaceWith(t.jsxExpressionContainer(t.callExpression(t.identifier('tr'),[t.stringLiteral(value)])));p.skip();},
 JSXExpressionContainer:{exit(p){if(p.parent.type==='JSXAttribute')return;const e=p.node.expression;if(t.isJSXEmptyExpression(e)||t.isCallExpression(e)&&t.isIdentifier(e.callee,{name:'tr'}))return;if(t.isMemberExpression(e)&&['name','text'].includes(e.property.name))return;if(t.isArrowFunctionExpression(e)||t.isFunctionExpression(e))return;needed=true;p.node.expression=t.callExpression(t.identifier('tr'),[e]);p.skip();}},
 JSXAttribute(p){if(!['placeholder','aria-label','title','alt'].includes(p.node.name.name))return;const v=p.node.value;if(t.isStringLiteral(v)&&/[А-Яа-яЁё]/.test(v.value)){needed=true;p.node.value=t.jsxExpressionContainer(t.callExpression(t.identifier('tr'),[v]));}},
 FunctionDeclaration:{exit(p){if(!p.node.id||!/^[A-Z]/.test(p.node.id.name))return;let contains=false;p.traverse({JSXElement(q){contains=true;q.stop();},JSXFragment(q){contains=true;q.stop();}});if(contains)p.node.body.body.unshift(t.variableDeclaration('const',[t.variableDeclarator(t.objectPattern([t.objectProperty(t.identifier('t'),t.identifier('tr'))]),t.callExpression(t.identifier('useI18n'),[]))]));}},
 Program:{exit(p){if(needed){const prefix=folder.endsWith('/pages')||folder.endsWith('/components')?'../i18n':'./i18n';p.node.body.unshift(t.importDeclaration([t.importSpecifier(t.identifier('useI18n'),t.identifier('useI18n'))],t.stringLiteral(prefix)));}}}
 }})]});if(needed)fs.writeFileSync(filename,output.code+'\n');
}
