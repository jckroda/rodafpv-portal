content = r"""import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const API_URL = '/api'

const i18n = {
  en: {
    'nav.portal':'CLIENT AREA','cta.book':'Book a Flight',
    'login.title':'Client Area','login.sub':'Sign in to your RODA FPV account',
    'login.email':'Email','login.password':'Password','login.cta':'Sign In',
    'login.forgot':'Forgot your password?','login.error':'Invalid email or password.',
    'footer.about':'A premium drone & cinematic production studio. Worldwide deployment, cinema-grade delivery.',
    'footer.inquiries':'Inquiries','footer.quote':'Request a quote',
    'footer.socials':'Socials','footer.legal':'Legal','footer.privacy':'Privacy',
    'footer.terms':'Terms','footer.licensing':'Licensing','footer.insurance':'Insurance',
    'footer.copy':'\u00a9 2026 RODA FPV \u00b7 All rights reserved',
    'footer.licensed':'Fully Insured \u2014 \u00a35M Public Liability \u00b7 EASA (EU) \u00b7 CAA (UK)',
    'tab.files':'Files','tab.contract':'Contract','tab.deposit':'Deposit',
    'tab.comments':'Comments','tab.appointments':'Appointments','tab.account':'Account',
    'files.empty':'No files available yet. Your content will appear here once uploaded.',
    'contract.title':'Service Contract','contract.nosign':'No contract available yet.',
    'contract.sign':'Sign Contract','contract.signed':'Signed','contract.download':'Download Signed PDF',
    'contract.checkbox':'I have read and agree to the terms of this contract.',
    'contract.name':'Type your full legal name to sign',
    'deposit.title':'Project Deposit','deposit.amount':'Amount (EUR)','deposit.pay':'Pay via Stripe',
    'deposit.history':'Payment History','deposit.empty':'No payments yet.',
    'comments.title':'Project Comments','comments.placeholder':'Write your message to the RODA FPV team...',
    'comments.send':'Send Message','comments.empty':'No messages yet. Start the conversation!',
    'comments.reply':'Reply from RODA FPV',
    'appt.title':'My Appointments','appt.book':'Book Appointment',
    'appt.date':'Date','appt.time':'Time','appt.service':'Service',
    'appt.location':'Location / Address','appt.confirm':'Confirm','appt.cancel':'Cancel',
    'appt.empty':'No appointments yet.',
    'account.name':'Name','account.email':'Email',
    'pwd.title':'Change Password','pwd.new':'New Password','pwd.confirm':'Confirm Password','pwd.cta':'Update Password',
    'dash.eyebrow':'Client Portal',
  },
  es: {
    'nav.portal':'\u00c1REA CLIENTES','cta.book':'Reservar un Vuelo',
    'login.title':'\u00c1rea de Clientes','login.sub':'Accede a tu cuenta RODA FPV',
    'login.email':'Correo','login.password':'Contrase\u00f1a','login.cta':'Entrar',
    'login.forgot':'\u00bfOlvidaste tu contrase\u00f1a?','login.error':'Email o contrase\u00f1a incorrectos.',
    'footer.about':'Un estudio premium de producci\u00f3n cinematogr\u00e1fica con drones.',
    'footer.inquiries':'Consultas','footer.quote':'Solicitar presupuesto',
    'footer.socials':'Redes','footer.legal':'Legal','footer.privacy':'Privacidad',
    'footer.terms':'T\u00e9rminos','footer.licensing':'Licencias','footer.insurance':'Seguros',
    'footer.copy':'\u00a9 2026 RODA FPV \u00b7 Todos los derechos reservados',
    'footer.licensed':'Completamente Asegurado \u2014 5M \u00a3 \u00b7 EASA (EU) \u00b7 CAA (UK)',
    'tab.files':'Archivos','tab.contract':'Contrato','tab.deposit':'Dep\u00f3sito',
    'tab.comments':'Comentarios','tab.appointments':'Citas','tab.account':'Cuenta',
    'files.empty':'Sin archivos a\u00fan.','contract.title':'Contrato de Servicio',
    'contract.sign':'Firmar Contrato','contract.signed':'Firmado','contract.download':'Descargar PDF Firmado',
    'contract.checkbox':'He le\u00eddo y acepto los t\u00e9rminos de este contrato.',
    'contract.name':'Escribe tu nombre legal completo para firmar',
    'deposit.title':'Dep\u00f3sito del Proyecto','deposit.amount':'Cantidad (EUR)','deposit.pay':'Pagar con Stripe',
    'deposit.history':'Historial de Pagos','deposit.empty':'Sin pagos a\u00fan.',
    'comments.title':'Comentarios del Proyecto','comments.placeholder':'Escribe tu mensaje al equipo RODA FPV...',
    'comments.send':'Enviar Mensaje','comments.empty':'Sin mensajes a\u00fan.',
    'comments.reply':'Respuesta de RODA FPV',
    'appt.title':'Mis Citas','appt.book':'Reservar Cita',
    'appt.date':'Fecha','appt.time':'Hora','appt.service':'Servicio',
    'appt.location':'Ubicaci\u00f3n / Direcci\u00f3n','appt.confirm':'Confirmar','appt.cancel':'Cancelar',
    'appt.empty':'Sin citas a\u00fan.',
    'account.name':'Nombre','account.email':'Correo',
    'pwd.title':'Cambiar Contrase\u00f1a','pwd.new':'Nueva Contrase\u00f1a','pwd.confirm':'Confirmar','pwd.cta':'Actualizar',
    'dash.eyebrow':'Portal de Clientes',
  }
}

function t(key, lang) {
  const base = i18n.en
  const dict = lang && i18n[lang] ? { ...base, ...i18n[lang] } : base
  return dict[key] || key
}

const Logo = ({ height = 40 }) => (
  React.createElement('svg', { style:{ height, width:'auto', display:'block' }, viewBox:'0 0 280 72', xmlns:'http://www.w3.org/2000/svg' },
    React.createElement('rect', { x:2, y:2, width:276, height:68, fill:'white', stroke:'#ff6b1a', strokeWidth:2 }),
    React.createElement('rect', { x:208, y:2, width:70, height:68, fill:'#ff6b1a' }),
    React.createElement('text', { x:16, y:53, fontFamily:"Inter,system-ui,sans-serif", fontWeight:900, fontSize:44, letterSpacing:-1, fill:'none', stroke:'#ff6b1a', strokeWidth:2.2, paintOrder:'stroke' }, 'RODA'),
    React.createElement('text', { x:128, y:53, fontFamily:"Inter,system-ui,sans-serif", fontWeight:900, fontSize:44, letterSpacing:-1, fill:'#ff6b1a', fontStyle:'italic' }, 'FPV')
  )
)

const inp = { width:'100%', padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, color:'#fff', fontFamily:'Inter,sans-serif', fontSize:14, outline:'none', boxSizing:'border-box' }
const focusIn = e => e.target.style.borderColor = '#ff6b1a'
const focusOut = e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'
const panel = { background:'#111114', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:24 }
const row = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10, padding:'12px 16px', marginBottom:10 }
const orangeBtn = { padding:'8px 18px', background:'#ff6b1a', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700 }
const ghostBtn = { padding:'8px 18px', background:'transparent', color:'#9aa0a6', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:600 }

const Nav = ({ user, lang, setLang, onLogout }) => {
  const [langOpen, setLangOpen] = useState(false)
  const langs = [['en','English'],['es','Espanol'],['nl','Nederlands'],['de','Deutsch'],['cs','Cestina']]
  return React.createElement('nav', { style:{ position:'fixed',top:0,left:0,right:0,height:68,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',background:'rgba(10,10,11,0.95)',backdropFilter:'blur(18px)',WebkitBackdropFilter:'blur(18px)',borderBottom:'1px solid rgba(255,255,255,0.08)',zIndex:100 }},
    React.createElement('a', { href:'https://rodafpv.com/', style:{ textDecoration:'none' }}, React.createElement(Logo, { height:40 })),
    React.createElement('div', { style:{ display:'flex',alignItems:'center',gap:14 }},
      user && React.createElement('button', { onClick:onLogout, style:{ border:'1px solid rgba(255,255,255,0.15)',color:'#fff',padding:'0 16px',height:36,borderRadius:999,fontSize:12,fontWeight:500,background:'transparent',cursor:'pointer' }}, 'Log Out'),
      React.createElement('div', { style:{ position:'relative' }},
        React.createElement('button', { onClick:e=>{ e.stopPropagation(); setLangOpen(o=>!o) }, style:{ display:'flex',alignItems:'center',gap:4,padding:'0 10px',height:34,borderRadius:999,background:'transparent',border:'1px solid rgba(255,255,255,0.08)',color:'#fff',fontWeight:700,fontSize:11,cursor:'pointer' }}, lang.toUpperCase()),
        langOpen && React.createElement('div', { style:{ position:'absolute',top:'calc(100% + 8px)',right:0,minWidth:140,background:'#111114',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:6,zIndex:60 }},
          ...langs.map(([code,label]) => React.createElement('button', { key:code, onClick:()=>{ setLang(code); setLangOpen(false); try{ localStorage.setItem('rodafpv_lang',code) }catch(e){} }, style:{ display:'flex',justifyContent:'space-between',width:'100%',padding:'8px 12px',background:lang===code?'#ff6b1a':'transparent',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:11 }},
            React.createElement('span', null, label), React.createElement('span', null, code.toUpperCase())
          ))
        )
      ),
      React.createElement('a', { href:'https://wa.me/447487256588', target:'_blank', rel:'noopener noreferrer', style:{ background:'#ff6b1a',color:'#fff',padding:'8px 16px',borderRadius:999,fontWeight:700,fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',textDecoration:'none',whiteSpace:'nowrap' }}, t('cta.book',lang))
    )
  )
}

const Footer = ({ lang }) =>
  React.createElement('footer', { style:{ background:'#111114',borderTop:'1px solid rgba(255,255,255,0.08)',padding:'40px 24px' }},
    React.createElement('div', { style:{ maxWidth:900,margin:'0 auto',display:'flex',flexWrap:'wrap',gap:32,justifyContent:'space-between' }},
      React.createElement('div', { style:{ maxWidth:260 }},
        React.createElement(Logo, { height:48 }),
        React.createElement('p', { style:{ color:'#9aa0a6',fontSize:13,lineHeight:1.7,marginTop:12 }}, t('footer.about',lang))
      ),
      React.createElement('div', null,
        React.createElement('h4', { style:{ fontSize:11,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'#9aa0a6',marginBottom:12 }}, t('footer.socials',lang)),
        React.createElement('div', { style:{ display:'flex',flexDirection:'column',gap:8 }},
          React.createElement('a', { href:'https://www.instagram.com/Roda_fpv', target:'_blank', rel:'noopener noreferrer', style:{ color:'#fff',textDecoration:'none',opacity:0.75,fontSize:14 }}, 'Instagram'),
          React.createElement('a', { href:'#', style:{ color:'#fff',textDecoration:'none',opacity:0.75,fontSize:14 }}, 'YouTube')
        )
      ),
      React.createElement('div', null,
        React.createElement('h4', { style:{ fontSize:11,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'#9aa0a6',marginBottom:12 }}, t('footer.legal',lang)),
        React.createElement('div', { style:{ display:'flex',flexDirection:'column',gap:8 }},
          React.createElement('a', { href:'#', style:{ color:'#fff',textDecoration:'none',opacity:0.75,fontSize:14 }}, t('footer.privacy',lang)),
          React.createElement('a', { href:'#', style:{ color:'#fff',textDecoration:'none',opacity:0.75,fontSize:14 }}, t('footer.terms',lang))
        )
      )
    ),
    React.createElement('div', { style:{ maxWidth:900,margin:'24px auto 0',paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.08)',display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,color:'#9aa0a6',fontSize:12 }},
      React.createElement('span', null, t('footer.copy',lang)),
      React.createElement('span', null, t('footer.licensed',lang))
    )
  )

const LoginView = ({ lang, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(API_URL + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || t('login.error',lang)); return }
      localStorage.setItem('token', data.token)
      onLogin(data.user, data.token)
    } catch(err) { setError('Could not connect to server.') }
    finally { setLoading(false) }
  }
  return React.createElement('div', { style:{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 24px' }},
    React.createElement('div', { style:{ background:'#111114',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'40px',width:'100%',maxWidth:400,textAlign:'center' }},
      React.createElement('div', { style:{ marginBottom:24,display:'flex',justifyContent:'center' }}, React.createElement(Logo, { height:44 })),
      React.createElement('h2', { style:{ fontSize:20,fontWeight:700,marginBottom:6 }}, t('login.title',lang)),
      React.createElement('p', { style:{ color:'#9aa0a6',fontSize:13,marginBottom:28 }}, t('login.sub',lang)),
      error && React.createElement('div', { style:{ background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',color:'#f87171',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:14 }}, error),
      React.createElement('form', { onSubmit:handleSubmit, style:{ display:'grid',gap:12,textAlign:'left' }},
        React.createElement('div', null,
          React.createElement('label', { style:{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#9aa0a6',textTransform:'uppercase',marginBottom:6 }}, t('login.email',lang)),
          React.createElement('input', { type:'email',value:email,onChange:e=>setEmail(e.target.value),placeholder:'you@example.com',required:true,style:inp,onFocus:focusIn,onBlur:focusOut })
        ),
        React.createElement('div', null,
          React.createElement('label', { style:{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#9aa0a6',textTransform:'uppercase',marginBottom:6 }}, t('login.password',lang)),
          React.createElement('input', { type:'password',value:password,onChange:e=>setPassword(e.target.value),placeholder:'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',required:true,style:inp,onFocus:focusIn,onBlur:focusOut })
        ),
        React.createElement('button', { type:'submit',disabled:loading,style:{ width:'100%',padding:'12px',background:'#ff6b1a',color:'#fff',border:'none',borderRadius:10,fontWeight:700,fontSize:13,cursor:'pointer',marginTop:4 }},
          loading ? '...' : t('login.cta',lang)
        )
      ),
      React.createElement('p', { style:{ marginTop:16,fontSize:12,color:'#9aa0a6' }},
        React.createElement('a', { href:'/reset-password',style:{ color:'#ff6b1a',textDecoration:'none' }}, t('login.forgot',lang))
      )
    )
  )
}

const FilesTab = ({ token, lang }) => {
  const [files, setFiles] = useState([])
  useEffect(() => {
    fetch(API_URL+'/content', { headers:{ 'Authorization':'Bearer '+token }}).then(r=>r.ok?r.json():[]).then(setFiles).catch(()=>{})
  }, [token])
  const download = async (id, title) => {
    try {
      const res = await fetch(API_URL+'/content/'+id+'/download', { headers:{ 'Authorization':'Bearer '+token }})
      if (!res.ok) { alert('Download failed'); return }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href=url; a.download=title||'file'
      document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url)
    } catch(e) { alert('Download error') }
  }
  return React.createElement('div', { style:panel },
    React.createElement('h3', { style:{ fontSize:14,fontWeight:700,marginBottom:16 }}, 'Files & Deliverables'),
    files.length===0
      ? React.createElement('p', { style:{ color:'#9aa0a6',fontSize:14 }}, t('files.empty',lang))
      : files.map(f => React.createElement('div', { key:f.id, style:{ ...row,display:'flex',justifyContent:'space-between',alignItems:'center' }},
          React.createElement('div', null,
            React.createElement('p', { style:{ fontWeight:500,fontSize:14,marginBottom:2 }}, f.title),
            React.createElement('p', { style:{ fontSize:12,color:'#9aa0a6' }}, f.file_size?(f.file_size/1048576).toFixed(2)+' MB':'')
          ),
          React.createElement('button', { onClick:()=>download(f.id,f.title), style:orangeBtn }, 'Download')
        ))
  )
}

const ContractTab = ({ token, lang }) => {
  const [contract, setContract] = useState(null)
  const [checked, setChecked] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [signing, setSigning] = useState(false)
  const [msg, setMsg] = useState('')
  useEffect(() => {
    fetch(API_URL+'/contracts/my', { headers:{ 'Authorization':'Bearer '+token }}).then(r=>r.ok?r.json():null).then(setContract).catch(()=>{})
  }, [token])
  const sign = async () => {
    if (!checked || !typedName.trim()) { setMsg('Please check the box and type your full legal name.'); return }
    setSigning(true); setMsg('')
    try {
      const res = await fetch(API_URL+'/contracts/sign', { method:'POST', headers:{ 'Authorization':'Bearer '+token,'Content-Type':'application/json' }, body:JSON.stringify({ typedName }) })
      const data = await res.json()
      if (res.ok) { setContract(data); setMsg('Contract signed successfully.') }
      else setMsg(data.error || 'Signing failed.')
    } catch(e) { setMsg('Error occurred.') }
    finally { setSigning(false) }
  }
  return React.createElement('div', { style:panel },
    React.createElement('h3', { style:{ fontSize:14,fontWeight:700,marginBottom:16 }}, t('contract.title',lang)),
    !contract
      ? React.createElement('p', { style:{ color:'#9aa0a6',fontSize:14 }}, t('contract.nosign',lang))
      : contract.signed_at
        ? React.createElement('div', { style:{ ...row,display:'flex',justifyContent:'space-between',alignItems:'center' }},
            React.createElement('div', null,
              React.createElement('p', { style:{ fontWeight:500,fontSize:14,marginBottom:2 }}, 'Service Contract'),
              React.createElement('p', { style:{ fontSize:12,color:'#10b981' }}, '\u2713 Signed by '+contract.typed_name+' \u00b7 '+new Date(contract.signed_at).toLocaleDateString('en-GB'))
            ),
            React.createElement('button', { onClick:()=>window.open(API_URL+'/contracts/download','_blank'), style:orangeBtn }, t('contract.download',lang))
          )
        : React.createElement('div', null,
            React.createElement('div', { style:{ ...row,marginBottom:16 }},
              React.createElement('p', { style:{ fontSize:13,color:'#9aa0a6',lineHeight:1.6 }}, 'Your service contract is ready to sign. Please read it carefully before signing.')
            ),
            React.createElement('label', { style:{ display:'flex',alignItems:'flex-start',gap:10,fontSize:13,color:'#ccc',marginBottom:14,cursor:'pointer' }},
              React.createElement('input', { type:'checkbox',checked,onChange:e=>setChecked(e.target.checked),style:{ marginTop:2,accentColor:'#ff6b1a' }}),
              t('contract.checkbox',lang)
            ),
            React.createElement('input', { type:'text',placeholder:t('contract.name',lang),value:typedName,onChange:e=>setTypedName(e.target.value),style:{ ...inp,marginBottom:12 },onFocus:focusIn,onBlur:focusOut }),
            msg && React.createElement('p', { style:{ fontSize:13,color:msg.includes('success')?'#10b981':'#f87171',marginBottom:10 }}, msg),
            React.createElement('button', { onClick:sign,disabled:signing, style:{ ...orangeBtn,padding:'11px 24px' }}, signing?'Signing...':t('contract.sign',lang))
          )
  )
}

const DepositTab = ({ token, lang }) => {
  const [amount, setAmount] = useState('')
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    fetch(API_URL+'/payments', { headers:{ 'Authorization':'Bearer '+token }}).then(r=>r.ok?r.json():[]).then(setPayments).catch(()=>{})
  }, [token])
  const pay = async () => {
    if (!amount || isNaN(amount) || Number(amount)<1) { alert('Enter a valid amount.'); return }
    setLoading(true)
    try {
      const res = await fetch(API_URL+'/payments/deposit', { method:'POST', headers:{ 'Authorization':'Bearer '+token,'Content-Type':'application/json' }, body:JSON.stringify({ amount:Number(amount) }) })
      const data = await res.json()
      if (res.ok && data.url) window.location.href = data.url
      else alert(data.error || 'Payment failed.')
    } catch(e) { alert('Error occurred.') }
    finally { setLoading(false) }
  }
  return React.createElement('div', { style:panel },
    React.createElement('h3', { style:{ fontSize:14,fontWeight:700,marginBottom:16 }}, t('deposit.title',lang)),
    React.createElement('div', { style:{ display:'flex',gap:10,marginBottom:24,alignItems:'flex-end' }},
      React.createElement('div', { style:{ flex:1 }},
        React.createElement('label', { style:{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#9aa0a6',textTransform:'uppercase',marginBottom:6 }}, t('deposit.amount',lang)),
        React.createElement('input', { type:'number',min:1,placeholder:'e.g. 200',value:amount,onChange:e=>setAmount(e.target.value),style:inp,onFocus:focusIn,onBlur:focusOut })
      ),
      React.createElement('button', { onClick:pay,disabled:loading, style:{ ...orangeBtn,padding:'12px 24px',fontSize:13 }}, loading?'...':t('deposit.pay',lang))
    ),
    React.createElement('h4', { style:{ fontSize:13,fontWeight:700,color:'#9aa0a6',marginBottom:12 }}, t('deposit.history',lang)),
    payments.length===0
      ? React.createElement('p', { style:{ color:'#9aa0a6',fontSize:14 }}, t('deposit.empty',lang))
      : payments.map(p => React.createElement('div', { key:p.id, style:{ ...row,display:'flex',justifyContent:'space-between',alignItems:'center' }},
          React.createElement('div', null,
            React.createElement('p', { style:{ fontWeight:500,fontSize:14,marginBottom:2 }}, '\u20ac'+Number(p.amount).toFixed(2)+' \u00b7 '+p.type),
            React.createElement('p', { style:{ fontSize:12,color:'#9aa0a6' }}, new Date(p.created_at).toLocaleDateString('en-GB'))
          ),
          React.createElement('span', { style:{ fontSize:11,fontWeight:700,color:'#10b981' }}, '\u2713 Paid')
        ))
  )
}

const CommentsTab = ({ token, lang }) => {
  const [comments, setComments] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const load = () => fetch(API_URL+'/comments', { headers:{ 'Authorization':'Bearer '+token }}).then(r=>r.ok?r.json():[]).then(setComments).catch(()=>{})
  useEffect(() => { load() }, [token])
  const send = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      const res = await fetch(API_URL+'/comments', { method:'POST', headers:{ 'Authorization':'Bearer '+token,'Content-Type':'application/json' }, body:JSON.stringify({ message }) })
      if (res.ok) { setMessage(''); load() }
    } catch(e) {}
    finally { setSending(false) }
  }
  return React.createElement('div', { style:panel },
    React.createElement('h3', { style:{ fontSize:14,fontWeight:700,marginBottom:16 }}, t('comments.title',lang)),
    comments.length===0
      ? React.createElement('p', { style:{ color:'#9aa0a6',fontSize:14,marginBottom:16 }}, t('comments.empty',lang))
      : React.createElement('div', { style:{ marginBottom:16 }},
          ...comments.map(c => React.createElement('div', { key:c.id, style:{ marginBottom:12 }},
            React.createElement('div', { style:{ background:'rgba(255,107,26,0.08)',border:'1px solid rgba(255,107,26,0.15)',borderRadius:10,padding:'12px 14px',marginBottom:c.reply?6:0 }},
              React.createElement('p', { style:{ fontSize:13,lineHeight:1.6 }}, c.message),
              React.createElement('p', { style:{ fontSize:11,color:'#9aa0a6',marginTop:4 }}, new Date(c.created_at).toLocaleDateString('en-GB'))
            ),
            c.reply && React.createElement('div', { style:{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:10,padding:'12px 14px',marginLeft:16 }},
              React.createElement('p', { style:{ fontSize:11,fontWeight:700,color:'#ff6b1a',marginBottom:4 }}, t('comments.reply',lang)),
              React.createElement('p', { style:{ fontSize:13,lineHeight:1.6 }}, c.reply),
              React.createElement('p', { style:{ fontSize:11,color:'#9aa0a6',marginTop:4 }}, new Date(c.reply_at).toLocaleDateString('en-GB'))
            )
          ))
        ),
    React.createElement('textarea', { value:message,onChange:e=>setMessage(e.target.value),placeholder:t('comments.placeholder',lang),rows:4,style:{ ...inp,resize:'vertical',marginBottom:10 },onFocus:focusIn,onBlur:focusOut }),
    React.createElement('button', { onClick:send,disabled:sending, style:{ ...orangeBtn,padding:'11px 24px',fontSize:13 }}, sending?'...':t('comments.send',lang))
  )
}

const AppointmentsTab = ({ token, lang }) => {
  const [appointments, setAppointments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [bookData, setBookData] = useState({ date:'',time:'',service:'',location:'' })
  const [bookMsg, setBookMsg] = useState('')
  const authHeaders = { 'Authorization':'Bearer '+token,'Content-Type':'application/json' }
  const load = () => fetch(API_URL+'/appointments', { headers:authHeaders }).then(r=>r.ok?r.json():[]).then(setAppointments).catch(()=>{})
  useEffect(() => { load() }, [token])
  const book = async (e) => {
    e.preventDefault(); setBookMsg('')
    try {
      const res = await fetch(API_URL+'/appointments', { method:'POST',headers:authHeaders,body:JSON.stringify(bookData) })
      const data = await res.json()
      if (res.ok) { setBookMsg('Appointment booked!'); setBookData({ date:'',time:'',service:'',location:'' }); setShowForm(false); load() }
      else setBookMsg(data.error || 'Failed to book.')
    } catch(e) { setBookMsg('Error occurred.') }
  }
  const cancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    await fetch(API_URL+'/appointments/'+id, { method:'DELETE',headers:authHeaders })
    load()
  }
  return React.createElement('div', { style:panel },
    React.createElement('div', { style:{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }},
      React.createElement('h3', { style:{ fontSize:14,fontWeight:700 }}, t('appt.title',lang)),
      !showForm && React.createElement('button', { onClick:()=>setShowForm(true), style:orangeBtn }, t('appt.book',lang))
    ),
    bookMsg && React.createElement('p', { style:{ fontSize:13,color:bookMsg.includes('booked')?'#10b981':'#f87171',marginBottom:12 }}, bookMsg),
    showForm && React.createElement('form', { onSubmit:book, style:{ ...row,display:'grid',gap:10,marginBottom:16 }},
      React.createElement('div', { style:{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }},
        React.createElement('div', null,
          React.createElement('label', { style:{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#9aa0a6',textTransform:'uppercase',marginBottom:6 }}, t('appt.date',lang)),
          React.createElement('input', { type:'date',value:bookData.date,onChange:e=>setBookData(p=>({...p,date:e.target.value})),required:true,style:inp,onFocus:focusIn,onBlur:focusOut })
        ),
        React.createElement('div', null,
          React.createElement('label', { style:{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#9aa0a6',textTransform:'uppercase',marginBottom:6 }}, t('appt.time',lang)),
          React.createElement('input', { type:'time',value:bookData.time,onChange:e=>setBookData(p=>({...p,time:e.target.value})),required:true,style:inp,onFocus:focusIn,onBlur:focusOut })
        )
      ),
      React.createElement('div', null,
        React.createElement('label', { style:{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#9aa0a6',textTransform:'uppercase',marginBottom:6 }}, t('appt.service',lang)),
        React.createElement('input', { type:'text',placeholder:'e.g. Pre-shoot consultation',value:bookData.service,onChange:e=>setBookData(p=>({...p,service:e.target.value})),required:true,style:inp,onFocus:focusIn,onBlur:focusOut })
      ),
      React.createElement('div', null,
        React.createElement('label', { style:{ display:'block',fontSize:11,fontWeight:600,letterSpacing:'0.1em',color:'#9aa0a6',textTransform:'uppercase',marginBottom:6 }}, t('appt.location',lang)),
        React.createElement('input', { type:'text',placeholder:'Address or video call link',value:bookData.location,onChange:e=>setBookData(p=>({...p,location:e.target.value})),required:true,style:inp,onFocus:focusIn,onBlur:focusOut })
      ),
      React.createElement('div', { style:{ display:'flex',gap:8 }},
        React.createElement('button', { type:'submit', style:orangeBtn }, t('appt.confirm',lang)),
        React.createElement('button', { type:'button',onClick:()=>setShowForm(false), style:ghostBtn }, t('appt.cancel',lang))
      )
    ),
    appointments.length===0 && !showForm
      ? React.createElement('p', { style:{ color:'#9aa0a6',fontSize:14 }}, t('appt.empty',lang))
      : appointments.map(a => React.createElement('div', { key:a.id, style:{ ...row,display:'flex',justifyContent:'space-between',alignItems:'center' }},
          React.createElement('div', null,
            React.createElement('p', { style:{ fontWeight:600,fontSize:14,marginBottom:4 }}, new Date(a.date).toLocaleDateString('en-GB')+(a.time?' \u00b7 '+a.time.slice(0,5):'')),
            a.service && React.createElement('p', { style:{ fontSize:13,color:'#ccc',marginBottom:2 }}, a.service),
            a.location && React.createElement('p', { style:{ fontSize:12,color:'#9aa0a6' }}, a.location)
          ),
          React.createElement('button', { onClick:()=>cancel(a.id), style:{ ...ghostBtn,color:'#f87171',borderColor:'rgba(239,68,68,0.3)' }}, t('appt.cancel',lang))
        ))
  )
}

const AccountTab = ({ token, lang, user }) => {
  const [pwdData, setPwdData] = useState({ newPassword:'',confirmPassword:'' })
  const [pwdMsg, setPwdMsg] = useState('')
  const changePwd = async (e) => {
    e.preventDefault(); setPwdMsg('')
    try {
      const res = await fetch(API_URL+'/auth/change-password', { method:'POST', headers:{ 'Authorization':'Bearer '+token,'Content-Type':'application/json' }, body:JSON.stringify(pwdData) })
      const data = await res.json()
      setPwdMsg(res.ok ? 'Password changed successfully.' : data.error || 'Failed')
      if (res.ok) setPwdData({ newPassword:'',confirmPassword:'' })
    } catch(e) { setPwdMsg('Error occurred.') }
  }
  const name = user.first_name||user.name||user.email.split('@')[0]
  return React.createElement('div', { style:panel },
    React.createElement('h3', { style:{ fontSize:14,fontWeight:700,marginBottom:16 }}, 'Account Details'),
    [['Name',user.name||name],['Email',user.email]].map(([label,value]) =>
      React.createElement('div', { key:label, style:row },
        React.createElement('p', { style:{ fontSize:12,color:'#9aa0a6',marginBottom:4 }}, label),
        React.createElement('p', { style:{ fontSize:15,fontWeight:500 }}, value)
      )
    ),
    React.createElement('h3', { style:{ fontSize:14,fontWeight:700,margin:'24px 0 14px' }}, t('pwd.title',lang)),
    React.createElement('form', { onSubmit:changePwd, style:{ display:'grid',gap:10 }},
      React.createElement('input', { type:'password',placeholder:t('pwd.new',lang),value:pwdData.newPassword,onChange:e=>setPwdData(p=>({...p,newPassword:e.target.value})),required:true,style:inp,onFocus:focusIn,onBlur:focusOut }),
      React.createElement('input', { type:'password',placeholder:t('pwd.confirm',lang),value:pwdData.confirmPassword,onChange:e=>setPwdData(p=>({...p,confirmPassword:e.target.value})),required:true,style:inp,onFocus:focusIn,onBlur:focusOut }),
      pwdMsg && React.createElement('p', { style:{ color:pwdMsg.includes('success')?'#10b981':'#f87171',fontSize:13 }}, pwdMsg),
      React.createElement('button', { type:'submit', style:{ ...orangeBtn,padding:'11px',fontSize:13,width:'100%' }}, t('pwd.cta',lang))
    )
  )
}

const DashboardView = ({ user, token, lang }) => {
  const [activeTab, setActiveTab] = useState('files')
  const tier = (user.tier||user.role||'starter').toLowerCase()
  const tierColors = { starter:{ bg:'rgba(255,255,255,0.07)',color:'#9aa0a6' },pro:{ bg:'rgba(0,224,255,0.1)',color:'#00e0ff' },elite:{ bg:'rgba(255,107,26,0.15)',color:'#ff6b1a' }}
  const tc = tierColors[tier]||tierColors.starter
  const name = user.first_name||user.name||user.email.split('@')[0]
  const tabs = ['files','contract','deposit','comments','appointments','account']
  const Tab = ({ id }) => React.createElement('button', { onClick:()=>setActiveTab(id), style:{ padding:'9px 16px',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600,fontSize:12,background:activeTab===id?'#ff6b1a':'transparent',color:activeTab===id?'#fff':'#9aa0a6',whiteSpace:'nowrap' }}, t('tab.'+id,lang))
  return React.createElement('div', { style:{ flex:1,display:'flex',flexDirection:'column' }},
    React.createElement('div', { style:{ background:'linear-gradient(135deg,rgba(255,107,26,0.12) 0%,transparent 60%)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'48px 24px 32px',textAlign:'center' }},
      React.createElement('span', { style:{ fontSize:10,letterSpacing:'0.4em',color:'#ff6b1a',fontWeight:600,textTransform:'uppercase',display:'block',marginBottom:10 }}, '— '+t('dash.eyebrow',lang)+' —'),
      React.createElement('h1', { style:{ fontWeight:700,fontSize:'clamp(22px,4vw,40px)',letterSpacing:'-0.02em',textTransform:'uppercase',marginBottom:12 }}, 'Welcome back, '+name),
      React.createElement('div', { style:{ display:'inline-flex',alignItems:'center',padding:'4px 14px',borderRadius:999,fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',background:tc.bg,color:tc.color }}, tier.charAt(0).toUpperCase()+tier.slice(1))
    ),
    React.createElement('div', { style:{ padding:'16px 24px 0',borderBottom:'1px solid rgba(255,255,255,0.08)',overflowX:'auto' }},
      React.createElement('div', { style:{ background:'#111114',borderRadius:10,padding:4,display:'inline-flex',gap:2,border:'1px solid rgba(255,255,255,0.08)' }},
        ...tabs.map(id => React.createElement(Tab, { key:id, id }))
      )
    ),
    React.createElement('div', { style:{ maxWidth:860,width:'100%',margin:'20px auto 60px',padding:'0 20px',flex:1 }},
      activeTab==='files'        && React.createElement(FilesTab,        { token, lang }),
      activeTab==='contract'     && React.createElement(ContractTab,     { token, lang }),
      activeTab==='deposit'      && React.createElement(DepositTab,      { token, lang }),
      activeTab==='comments'     && React.createElement(CommentsTab,     { token, lang }),
      activeTab==='appointments' && React.createElement(AppointmentsTab, { token, lang }),
      activeTab==='account'      && React.createElement(AccountTab,      { token, lang, user })
    )
  )
}

const App = () => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [lang, setLang] = useState(() => { try{ return localStorage.getItem('rodafpv_lang')||'en' }catch(e){ return 'en' }})
  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (!stored) return
    setToken(stored)
    fetch(API_URL+'/auth/me', { headers:{ 'Authorization':'Bearer '+stored }})
      .then(r=>r.ok?r.json():null)
      .then(u=>{ if(u) setUser(u); else { localStorage.removeItem('token'); setToken(null) }})
      .catch(()=>{ localStorage.removeItem('token'); setToken(null) })
  }, [])
  const handleLogin = (u, tk) => { setUser(u); setToken(tk) }
  const handleLogout = () => { localStorage.removeItem('token'); setUser(null); setToken(null) }
  return React.createElement(React.Fragment, null,
    React.createElement('style', null, [
      "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');",
      "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}",
      "html,body{background:#0a0a0b;color:#fff;font-family:'Inter',system-ui,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}",
      "#root{display:flex;flex-direction:column;min-height:100vh}",
      "textarea{font-family:'Inter',system-ui,sans-serif}",
      "::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,107,26,0.4);border-radius:4px}"
    ].join('')),
    React.createElement(Nav, { user, lang, setLang, onLogout:handleLogout }),
    React.createElement('div', { style:{ paddingTop:68,display:'flex',flexDirection:'column',flex:1 }},
      user
        ? React.createElement(DashboardView, { user, token, lang })
        : React.createElement(LoginView, { lang, onLogin:handleLogin })
    ),
    React.createElement(Footer, { lang })
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null))
"""

path = '/volume1/docker/client-menu/booking-app/frontend/src/main.jsx'
with open(path, 'w') as f:
    f.write(content)
print('Done! Lines written:', len(content.splitlines()))
