import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const API_URL = '/api'

const s = {
  th: { padding:'12px 16px', textAlign:'left', fontWeight:'600', fontSize:'13px', color:'#333', borderBottom:'2px solid #e5e7eb' },
  td: { padding:'12px 16px', fontSize:'14px', borderBottom:'1px solid #f3f4f6', color:'#444' },
  btn: (c) => ({ padding:'6px 14px', background:c, color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }),
  tab: (active) => ({ padding:'10px 20px', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'500', fontSize:'14px', background:active?'#ff6b1a':'transparent', color:active?'white':'#555' }),
  inp: { padding:'10px 12px', border:'1px solid #ddd', borderRadius:'8px', fontSize:'14px', width:'100%', boxSizing:'border-box' },
  card: { background:'white', borderRadius:'12px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', overflow:'hidden' },
  label: { display:'block', fontSize:'12px', fontWeight:'600', color:'#666', marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }
}

const fmt = {
  date: d => d ? new Date(d).toLocaleDateString('en-GB') : '-',
  datetime: d => d ? new Date(d).toLocaleString('en-GB') : '-',
  size: b => b ? (b/1048576).toFixed(2)+' MB' : '-',
  money: n => n ? '\u20ac'+Number(n).toFixed(2) : '-'
}

const AdminApp = () => {
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [formData, setFormData] = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [files, setFiles] = useState([])
  const [comments, setComments] = useState([])
  const [payments, setPayments] = useState([])
  const [contracts, setContracts] = useState([])
  const [uploadUsers, setUploadUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [replyTexts, setReplyTexts] = useState({})
  const [creatingContract, setCreatingContract] = useState({})

  const ah = { 'Authorization':'Bearer '+token, 'Content-Type':'application/json' }

  useEffect(() => {
    if (token) { fetchUsers(); fetchAppointments(); fetchFiles(); fetchComments(); fetchPayments(); fetchContracts() }
  }, [token])

  const fetchUsers = () => fetch(API_URL+'/admin/users', { headers:ah }).then(r=>r.ok?r.json():[]).then(d=>{ setUsers(d); setUploadUsers(d) }).catch(()=>{})
  const fetchAppointments = () => fetch(API_URL+'/admin/appointments', { headers:ah }).then(r=>r.ok?r.json():[]).then(setAppointments).catch(()=>{})
  const fetchFiles = () => fetch(API_URL+'/admin/files', { headers:ah }).then(r=>r.ok?r.json():[]).then(setFiles).catch(()=>{})
  const fetchComments = () => fetch(API_URL+'/admin/comments', { headers:ah }).then(r=>r.ok?r.json():[]).then(setComments).catch(()=>{})
  const fetchPayments = () => fetch(API_URL+'/admin/payments', { headers:ah }).then(r=>r.ok?r.json():[]).then(setPayments).catch(()=>{})
  const fetchContracts = () => fetch(API_URL+'/admin/contracts', { headers:ah }).then(r=>r.ok?r.json():[]).then(setContracts).catch(()=>{})

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(API_URL+'/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(formData) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      localStorage.setItem('admin_token', data.token)
      setToken(data.token)
    } catch { setError('Error occurred') } finally { setLoading(false) }
  }

  const handleLogout = () => { localStorage.removeItem('admin_token'); setToken(null) }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and all their data?')) return
    await fetch(API_URL+'/admin/users/'+id, { method:'DELETE', headers:ah })
    fetchUsers()
  }

  const updateTier = async (id, tier) => {
    await fetch(API_URL+'/admin/users/'+id+'/tier', { method:'PATCH', headers:ah, body:JSON.stringify({ tier }) })
    fetchUsers()
  }

  const createContract = async (userId) => {
    setCreatingContract(p => ({ ...p, [userId]: true }))
    try {
      const res = await fetch(API_URL+'/admin/contracts/create', { method:'POST', headers:ah, body:JSON.stringify({ user_id: userId }) })
      const data = await res.json()
      if (res.ok) { fetchContracts() }
      else alert(data.error || 'Failed to create contract')
    } catch { alert('Error occurred') }
    finally { setCreatingContract(p => ({ ...p, [userId]: false })) }
  }

  const deleteContract = async (id) => {
    if (!confirm('Delete this contract?')) return
    await fetch(API_URL+'/admin/contracts/'+id, { method:'DELETE', headers:ah })
    fetchContracts()
  }

  const deleteAppointment = async (id) => {
    if (!confirm('Delete this appointment?')) return
    await fetch(API_URL+'/admin/appointments/'+id, { method:'DELETE', headers:ah })
    fetchAppointments()
  }

  const updateApptStatus = async (id, status) => {
    await fetch(API_URL+'/admin/appointments/'+id, { method:'PATCH', headers:ah, body:JSON.stringify({ status }) })
    fetchAppointments()
  }

  const deleteFile = async (id) => {
    if (!confirm('Delete this file?')) return
    await fetch(API_URL+'/admin/files/'+id, { method:'DELETE', headers:ah })
    fetchFiles()
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile || !selectedUserId) { setUploadMsg('Please select a customer and file'); return }
    setUploading(true); setUploadMsg('')
    const fd = new FormData()
    fd.append('file', selectedFile)
    fd.append('user_id', selectedUserId)
    try {
      const res = await fetch(API_URL+'/admin/upload', { method:'POST', headers:{ 'Authorization':'Bearer '+token }, body:fd })
      const data = await res.json()
      if (res.ok) { setUploadMsg('File uploaded successfully'); setSelectedFile(null); setSelectedUserId(''); document.getElementById('fileInput').value=''; fetchFiles() }
      else setUploadMsg(data.error || 'Upload failed')
    } catch { setUploadMsg('Upload error') } finally { setUploading(false) }
  }

  const sendReply = async (id) => {
    const reply = replyTexts[id]
    if (!reply || !reply.trim()) return
    await fetch(API_URL+'/admin/comments/'+id+'/reply', { method:'PATCH', headers:ah, body:JSON.stringify({ reply }) })
    setReplyTexts(p => ({ ...p, [id]:'' }))
    fetchComments()
  }

  const deleteComment = async (id) => {
    if (!confirm('Delete this comment?')) return
    await fetch(API_URL+'/admin/comments/'+id, { method:'DELETE', headers:ah })
    fetchComments()
  }

  const hasContract = (userId) => contracts.some(c => c.user_id === userId || c.email === users.find(u=>u.id===userId)?.email)

  if (!token) return (
    React.createElement('div', { style:{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'#0a0a0b' }},
      React.createElement('div', { style:{ background:'#111114', border:'1px solid rgba(255,255,255,0.08)', padding:'40px', borderRadius:'16px', maxWidth:'380px', width:'100%', textAlign:'center' }},
        React.createElement('svg', { style:{ height:44, width:'auto', marginBottom:24, display:'block', margin:'0 auto 24px' }, viewBox:'0 0 280 72', xmlns:'http://www.w3.org/2000/svg' },
          React.createElement('rect', { x:2, y:2, width:276, height:68, fill:'white', stroke:'#ff6b1a', strokeWidth:2 }),
          React.createElement('rect', { x:208, y:2, width:70, height:68, fill:'#ff6b1a' }),
          React.createElement('text', { x:16, y:53, fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:44, letterSpacing:-1, fill:'none', stroke:'#ff6b1a', strokeWidth:2.2, paintOrder:'stroke' }, 'RODA'),
          React.createElement('text', { x:128, y:53, fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:44, letterSpacing:-1, fill:'#ff6b1a', fontStyle:'italic' }, 'FPV')
        ),
        React.createElement('h2', { style:{ color:'#fff', fontSize:20, fontWeight:700, marginBottom:6 }}, 'Admin Panel'),
        React.createElement('p', { style:{ color:'#9aa0a6', fontSize:13, marginBottom:28 }}, 'Sign in to manage your portal'),
        React.createElement('form', { onSubmit:handleLogin, style:{ display:'grid', gap:12, textAlign:'left' }},
          React.createElement('div', null,
            React.createElement('label', { style:{ ...s.label, color:'#9aa0a6' }}, 'Email'),
            React.createElement('input', { type:'email', placeholder:'admin@rodafpv.com', value:formData.email,
              onChange:e=>setFormData(p=>({...p,email:e.target.value})), required:true,
              style:{ ...s.inp, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff' }})
          ),
          React.createElement('div', null,
            React.createElement('label', { style:{ ...s.label, color:'#9aa0a6' }}, 'Password'),
            React.createElement('input', { type:'password', placeholder:'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022', value:formData.password,
              onChange:e=>setFormData(p=>({...p,password:e.target.value})), required:true,
              style:{ ...s.inp, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#fff' }})
          ),
          error && React.createElement('p', { style:{ color:'#f87171', fontSize:13 }}, error),
          React.createElement('button', { type:'submit', disabled:loading,
            style:{ padding:'12px', background:'#ff6b1a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:14 }},
            loading ? '...' : 'Sign In')
        )
      )
    )
  )

  const tabs = [
    { id:'users', label:'Users' },
    { id:'appointments', label:'Appointments' },
    { id:'comments', label:'Comments' },
    { id:'payments', label:'Payments' },
    { id:'contracts', label:'Contracts' },
    { id:'content', label:'Content' },
  ]

  const tierBadge = (tier) => React.createElement('span', { style:{
    padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, textTransform:'uppercase',
    background: tier==='elite'?'rgba(255,107,26,0.15)':tier==='pro'?'rgba(0,224,255,0.1)':'rgba(0,0,0,0.05)',
    color: tier==='elite'?'#ff6b1a':tier==='pro'?'#0891b2':'#666'
  }}, tier||'starter')

  return (
    React.createElement('div', { style:{ minHeight:'100vh', background:'#f5f5f5' }},
      React.createElement('nav', { style:{ background:'#0a0a0b', padding:'0 24px', display:'flex', justifyContent:'space-between', alignItems:'center', height:60, borderBottom:'1px solid rgba(255,255,255,0.08)' }},
        React.createElement('svg', { style:{ height:36, width:'auto' }, viewBox:'0 0 280 72', xmlns:'http://www.w3.org/2000/svg' },
          React.createElement('rect', { x:2, y:2, width:276, height:68, fill:'white', stroke:'#ff6b1a', strokeWidth:2 }),
          React.createElement('rect', { x:208, y:2, width:70, height:68, fill:'#ff6b1a' }),
          React.createElement('text', { x:16, y:53, fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:44, letterSpacing:-1, fill:'none', stroke:'#ff6b1a', strokeWidth:2.2, paintOrder:'stroke' }, 'RODA'),
          React.createElement('text', { x:128, y:53, fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:44, letterSpacing:-1, fill:'#ff6b1a', fontStyle:'italic' }, 'FPV')
        ),
        React.createElement('div', { style:{ display:'flex', alignItems:'center', gap:16 }},
          React.createElement('span', { style:{ color:'#9aa0a6', fontSize:13 }}, 'Admin Panel'),
          React.createElement('button', { onClick:handleLogout, style:{ ...s.btn('#ef4444'), fontWeight:600 }}, 'Logout')
        )
      ),

      React.createElement('div', { style:{ maxWidth:1100, margin:'24px auto', padding:'0 16px' }},

        React.createElement('div', { style:{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }},
          ...[['Users',users.length,'#3b82f6'],['Appointments',appointments.length,'#ff6b1a'],['Comments',comments.length,'#8b5cf6'],['Payments',payments.length,'#10b981'],['Contracts',contracts.length,'#f59e0b']].map(([label,val,color])=>
            React.createElement('div', { key:label, style:{ background:'white', borderRadius:12, padding:'16px 20px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', borderLeft:'4px solid '+color }},
              React.createElement('p', { style:{ fontSize:12, color:'#999', marginBottom:4 }}, label),
              React.createElement('p', { style:{ fontSize:24, fontWeight:700, color:'#333' }}, val)
            )
          )
        ),

        React.createElement('div', { style:{ background:'white', borderRadius:12, padding:6, marginBottom:20, display:'inline-flex', gap:4, boxShadow:'0 1px 3px rgba(0,0,0,0.08)', flexWrap:'wrap' }},
          ...tabs.map(tab => React.createElement('button', { key:tab.id, style:s.tab(activeTab===tab.id), onClick:()=>setActiveTab(tab.id) }, tab.label))
        ),

        activeTab==='users' && React.createElement('div', { style:s.card },
          React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' }},
            React.createElement('thead', null, React.createElement('tr', { style:{ background:'#f9fafb' }},
              ...['Name','Email','Tier','Joined','Change Tier','Contract','Action'].map(h=>React.createElement('th', { key:h, style:s.th }, h))
            )),
            React.createElement('tbody', null,
              users.length===0 && React.createElement('tr', null, React.createElement('td', { colSpan:7, style:{ ...s.td, textAlign:'center', color:'#999' }}, 'No users yet')),
              ...users.map(u => React.createElement('tr', { key:u.id },
                React.createElement('td', { style:s.td }, u.name),
                React.createElement('td', { style:s.td }, u.email),
                React.createElement('td', { style:s.td }, tierBadge(u.tier)),
                React.createElement('td', { style:s.td }, fmt.date(u.created_at)),
                React.createElement('td', { style:s.td },
                  React.createElement('select', { value:u.tier||'starter', onChange:e=>updateTier(u.id,e.target.value),
                    style:{ padding:'4px 8px', borderRadius:6, border:'1px solid #ddd', fontSize:13 }},
                    React.createElement('option', { value:'starter' }, 'Starter'),
                    React.createElement('option', { value:'pro' }, 'Pro'),
                    React.createElement('option', { value:'elite' }, 'Elite')
                  )
                ),
                React.createElement('td', { style:s.td },
                  contracts.some(c=>c.email===u.email)
                    ? React.createElement('span', { style:{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:'rgba(16,185,129,0.1)', color:'#10b981' }}, 'Created')
                    : React.createElement('button', { onClick:()=>createContract(u.id), disabled:!!creatingContract[u.id],
                        style:{ ...s.btn('#f59e0b'), fontWeight:600 }},
                        creatingContract[u.id] ? '...' : 'Create Contract')
                ),
                React.createElement('td', { style:s.td },
                  React.createElement('button', { onClick:()=>deleteUser(u.id), style:s.btn('#ef4444') }, 'Delete')
                )
              ))
            )
          )
        ),

        activeTab==='appointments' && React.createElement('div', { style:s.card },
          React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' }},
            React.createElement('thead', null, React.createElement('tr', { style:{ background:'#f9fafb' }},
              ...['User','Date','Time','Service','Location','Status','Action'].map(h=>React.createElement('th', { key:h, style:s.th }, h))
            )),
            React.createElement('tbody', null,
              appointments.length===0 && React.createElement('tr', null, React.createElement('td', { colSpan:7, style:{ ...s.td, textAlign:'center', color:'#999' }}, 'No appointments yet')),
              ...appointments.map(a => React.createElement('tr', { key:a.id },
                React.createElement('td', { style:s.td }, React.createElement('div', null, a.user_name), React.createElement('div', { style:{ fontSize:12, color:'#999' }}, a.email)),
                React.createElement('td', { style:s.td }, fmt.date(a.date)),
                React.createElement('td', { style:s.td }, a.time ? a.time.slice(0,5) : '-'),
                React.createElement('td', { style:s.td }, a.service),
                React.createElement('td', { style:s.td }, a.location),
                React.createElement('td', { style:s.td },
                  React.createElement('select', { value:a.status, onChange:e=>updateApptStatus(a.id,e.target.value),
                    style:{ padding:'4px 8px', borderRadius:6, border:'1px solid #ddd', fontSize:13 }},
                    ...['pending','confirmed','completed','cancelled'].map(st=>React.createElement('option', { key:st, value:st }, st))
                  )
                ),
                React.createElement('td', { style:s.td }, React.createElement('button', { onClick:()=>deleteAppointment(a.id), style:s.btn('#ef4444') }, 'Delete'))
              ))
            )
          )
        ),

        activeTab==='comments' && React.createElement('div', { style:{ display:'grid', gap:12 }},
          comments.length===0 && React.createElement('div', { style:{ ...s.card, padding:24, color:'#999', textAlign:'center' }}, 'No comments yet'),
          ...comments.map(c => React.createElement('div', { key:c.id, style:{ ...s.card, padding:20 }},
            React.createElement('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }},
              React.createElement('div', null,
                React.createElement('span', { style:{ fontWeight:600, fontSize:14, color:'#333' }}, c.user_name),
                React.createElement('span', { style:{ fontSize:12, color:'#999', marginLeft:8 }}, c.email),
                React.createElement('span', { style:{ fontSize:12, color:'#bbb', marginLeft:8 }}, fmt.datetime(c.created_at))
              ),
              React.createElement('button', { onClick:()=>deleteComment(c.id), style:s.btn('#ef4444') }, 'Delete')
            ),
            React.createElement('div', { style:{ background:'#f9fafb', borderRadius:8, padding:'12px 14px', marginBottom:12, fontSize:14, color:'#333', lineHeight:1.6 }}, c.message),
            c.reply
              ? React.createElement('div', { style:{ background:'rgba(255,107,26,0.05)', border:'1px solid rgba(255,107,26,0.15)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#555' }},
                  React.createElement('span', { style:{ fontWeight:700, color:'#ff6b1a', marginRight:8 }}, 'Your reply:'),
                  c.reply,
                  React.createElement('span', { style:{ fontSize:11, color:'#bbb', marginLeft:8 }}, fmt.datetime(c.reply_at))
                )
              : React.createElement('div', { style:{ display:'flex', gap:8 }},
                  React.createElement('input', { placeholder:'Type your reply...', value:replyTexts[c.id]||'',
                    onChange:e=>setReplyTexts(p=>({...p,[c.id]:e.target.value})),
                    onKeyDown:e=>e.key==='Enter'&&sendReply(c.id),
                    style:{ ...s.inp, flex:1 }}),
                  React.createElement('button', { onClick:()=>sendReply(c.id), style:{ ...s.btn('#ff6b1a'), padding:'8px 20px', fontWeight:600 }}, 'Reply')
                )
          ))
        ),

        activeTab==='payments' && React.createElement('div', { style:s.card },
          React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' }},
            React.createElement('thead', null, React.createElement('tr', { style:{ background:'#f9fafb' }},
              ...['User','Amount','Type','Status','Date'].map(h=>React.createElement('th', { key:h, style:s.th }, h))
            )),
            React.createElement('tbody', null,
              payments.length===0 && React.createElement('tr', null, React.createElement('td', { colSpan:5, style:{ ...s.td, textAlign:'center', color:'#999' }}, 'No payments yet')),
              ...payments.map(p => React.createElement('tr', { key:p.id },
                React.createElement('td', { style:s.td }, React.createElement('div', null, p.user_name), React.createElement('div', { style:{ fontSize:12, color:'#999' }}, p.email)),
                React.createElement('td', { style:s.td }, React.createElement('strong', null, fmt.money(p.amount))),
                React.createElement('td', { style:s.td }, React.createElement('span', { style:{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, textTransform:'uppercase', background:'rgba(59,130,246,0.1)', color:'#3b82f6' }}, p.type)),
                React.createElement('td', { style:s.td }, React.createElement('span', { style:{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, textTransform:'uppercase', background:'rgba(16,185,129,0.1)', color:'#10b981' }}, p.status)),
                React.createElement('td', { style:s.td }, fmt.date(p.created_at))
              ))
            )
          )
        ),

        activeTab==='contracts' && React.createElement('div', { style:s.card },
          React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' }},
            React.createElement('thead', null, React.createElement('tr', { style:{ background:'#f9fafb' }},
              ...['Client','Tier','Created','Status','Signed By','Signed At','Action'].map(h=>React.createElement('th', { key:h, style:s.th }, h))
            )),
            React.createElement('tbody', null,
              contracts.length===0 && React.createElement('tr', null, React.createElement('td', { colSpan:7, style:{ ...s.td, textAlign:'center', color:'#999' }}, 'No contracts yet. Create one from the Users tab.')),
              ...contracts.map(c => React.createElement('tr', { key:c.id },
                React.createElement('td', { style:s.td }, React.createElement('div', null, c.user_name), React.createElement('div', { style:{ fontSize:12, color:'#999' }}, c.email)),
                React.createElement('td', { style:s.td }, tierBadge(c.tier)),
                React.createElement('td', { style:s.td }, fmt.date(c.created_at)),
                React.createElement('td', { style:s.td },
                  c.signed_at
                    ? React.createElement('span', { style:{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:'rgba(16,185,129,0.1)', color:'#10b981' }}, 'Signed')
                    : React.createElement('span', { style:{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, background:'rgba(245,158,11,0.1)', color:'#f59e0b' }}, 'Pending')
                ),
                React.createElement('td', { style:s.td }, c.typed_name || '-'),
                React.createElement('td', { style:s.td }, fmt.datetime(c.signed_at)),
                React.createElement('td', { style:s.td }, React.createElement('button', { onClick:()=>deleteContract(c.id), style:s.btn('#ef4444') }, 'Delete'))
              ))
            )
          )
        ),

        activeTab==='content' && React.createElement('div', { style:{ display:'grid', gap:20 }},
          React.createElement('div', { style:{ ...s.card, padding:24 }},
            React.createElement('h3', { style:{ marginBottom:16, fontSize:16, fontWeight:600, color:'#333' }}, 'Upload File to Client'),
            React.createElement('form', { onSubmit:handleUpload, style:{ display:'grid', gap:12 }},
              React.createElement('div', null,
                React.createElement('label', { style:s.label }, 'Select Client'),
                React.createElement('select', { value:selectedUserId, onChange:e=>setSelectedUserId(e.target.value), style:s.inp },
                  React.createElement('option', { value:'' }, 'Choose client...'),
                  ...uploadUsers.map(u=>React.createElement('option', { key:u.id, value:u.id }, u.name+' — '+u.email))
                )
              ),
              React.createElement('div', null,
                React.createElement('label', { style:s.label }, 'Video File'),
                React.createElement('input', { id:'fileInput', type:'file', accept:'video/*', onChange:e=>setSelectedFile(e.target.files[0]), style:{ fontSize:14 }})
              ),
              uploadMsg && React.createElement('p', { style:{ color:uploadMsg.includes('success')?'#10b981':'#ef4444', fontSize:14 }}, uploadMsg),
              React.createElement('button', { type:'submit', disabled:uploading,
                style:{ padding:'11px', background:'#ff6b1a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:14 }},
                uploading ? 'Uploading...' : 'Upload')
            )
          ),
          React.createElement('div', { style:s.card },
            React.createElement('table', { style:{ width:'100%', borderCollapse:'collapse' }},
              React.createElement('thead', null, React.createElement('tr', { style:{ background:'#f9fafb' }},
                ...['Client','File','Size','Uploaded','Action'].map(h=>React.createElement('th', { key:h, style:s.th }, h))
              )),
              React.createElement('tbody', null,
                files.length===0 && React.createElement('tr', null, React.createElement('td', { colSpan:5, style:{ ...s.td, textAlign:'center', color:'#999' }}, 'No files yet')),
                ...files.map(f => React.createElement('tr', { key:f.id },
                  React.createElement('td', { style:s.td }, React.createElement('div', null, f.user_name), React.createElement('div', { style:{ fontSize:12, color:'#999' }}, f.email)),
                  React.createElement('td', { style:s.td }, f.original_filename),
                  React.createElement('td', { style:s.td }, fmt.size(f.file_size)),
                  React.createElement('td', { style:s.td }, fmt.date(f.created_at)),
                  React.createElement('td', { style:s.td }, React.createElement('button', { onClick:()=>deleteFile(f.id), style:s.btn('#ef4444') }, 'Delete'))
                ))
              )
            )
          )
        )
      )
    )
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(AdminApp, null))
