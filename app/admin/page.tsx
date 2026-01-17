'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  image_url?: string | null
  created_at?: string
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // search
  const [q, setQ] = useState('')

  // Add form
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  // Edit modal
  const [editing, setEditing] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return alert('โหลดสินค้าไม่สำเร็จ: ' + error.message)
    setProducts((data as Product[]) || [])
  }

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase()
    if (!text) return products
    return products.filter((p) => {
      const hay = `${p.name} ${p.price} ${p.stock}`.toLowerCase()
      return hay.includes(text)
    })
  }, [products, q])

  async function addProduct(e: React.FormEvent) {
    e.preventDefault()

    const p = Number(price)
    const s = Number(stock)

    if (!name.trim()) return alert('กรอกชื่อสินค้า')
    if (Number.isNaN(p) || p <= 0) return alert('ราคาต้องมากกว่า 0')
    if (Number.isNaN(s) || s < 0) return alert('Stock ต้องเป็น 0 ขึ้นไป')

    setLoading(true)
    const { error } = await supabase.from('products').insert([
      {
        name: name.trim(),
        price: p,
        stock: s,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
      },
    ])
    setLoading(false)

    if (error) return alert('เพิ่มสินค้าไม่สำเร็จ: ' + error.message)

    setName('')
    setPrice('')
    setStock('')
    setImageUrl('')
    await loadProducts()
    alert('เพิ่มสินค้าแล้ว ✅')
  }

  function openEdit(p: Product) {
    setEditing(p)
    setEditName(p.name ?? '')
    setEditPrice(String(p.price ?? ''))
    setEditStock(String(p.stock ?? ''))
    setEditImageUrl(p.image_url ?? '')
  }

  function closeEdit() {
    setEditing(null)
  }

  async function saveEdit() {
    if (!editing) return

    const p = Number(editPrice)
    const s = Number(editStock)

    if (!editName.trim()) return alert('กรอกชื่อสินค้า')
    if (Number.isNaN(p) || p <= 0) return alert('ราคาต้องมากกว่า 0')
    if (Number.isNaN(s) || s < 0) return alert('Stock ต้องเป็น 0 ขึ้นไป')

    setLoading(true)
    const { error } = await supabase
      .from('products')
      .update({
        name: editName.trim(),
        price: p,
        stock: s,
        image_url: editImageUrl.trim() ? editImageUrl.trim() : null,
      })
      .eq('id', editing.id)

    setLoading(false)
    if (error) return alert('แก้ไขไม่สำเร็จ: ' + error.message)

    closeEdit()
    await loadProducts()
    alert('บันทึกแล้ว ✅')
  }

  async function deleteProduct(id: string) {
    const ok = confirm('ลบสินค้านี้แน่ใจไหม?')
    if (!ok) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return alert('ลบไม่สำเร็จ: ' + error.message)

    await loadProducts()
  }

  return (
    <main style={{ minHeight: '100vh', background: '#fdecec', fontFamily: 'system-ui' }}>
      {/* TOP RED HEADER */}
      <header
        style={{
          background: '#7a0c1d',
          color: '#fff',
          padding: '26px 32px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 40, fontWeight: 900, letterSpacing: 0.5 }}>
              🍫 Chocolate Shop — Admin
            </h1>
            <p style={{ margin: '6px 0 0', opacity: 0.9 }}>
              เพิ่ม / ลบ / แก้ไข สินค้า (แบบตาราง)
            </p>
          </div>

          <a
            href="/"
            style={{
              background: '#f4c430',
              color: '#7a0c1d',
              padding: '12px 18px',
              borderRadius: 14,
              fontWeight: 900,
              textDecoration: 'none',
              boxShadow: '0 6px 14px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            ← กลับหน้าเว็บ
          </a>
        </div>
      </header>

      <div style={{ padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* ADD FORM */}
          <section style={card}>
            <h2 style={{ margin: 0, color: '#7a0c1d', fontSize: 26, fontWeight: 900 }}>
              ➕ เพิ่มสินค้าใหม่
            </h2>
            <p style={{ margin: '8px 0 16px', opacity: 0.75 }}>
              Image URL ควรเป็นลิงก์รูปตรง (.jpg / .png) เพื่อให้แสดงผลได้ชัวร์
            </p>

            <form onSubmit={addProduct} style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อสินค้า" style={inputStyle} />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ราคา (บาท)" inputMode="numeric" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.4fr', gap: 12 }}>
                <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock" inputMode="numeric" style={inputStyle} />
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" style={inputStyle} />
              </div>

              <button
                disabled={loading}
                style={{
                  height: 46,
                  borderRadius: 14,
                  border: 'none',
                  fontWeight: 900,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#ddd' : '#f4c430',
                  color: '#7a0c1d',
                  boxShadow: '0 12px 18px rgba(0,0,0,0.12)',
                }}
              >
                {loading ? 'กำลังทำงาน...' : 'เพิ่มสินค้า'}
              </button>
            </form>
          </section>

          {/* TABLE */}
          <section style={{ marginTop: 18 }}>
            <div style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>📋 รายการสินค้า</h2>
                  <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
                    แสดง {filtered.length} / ทั้งหมด {products.length}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 10, opacity: 0.55 }}>🔎</span>
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="ค้นหาชื่อ / ราคา / stock..."
                      style={{ ...inputStyle, paddingLeft: 36, width: 320, maxWidth: '70vw' }}
                    />
                  </div>

                  <button
                    onClick={loadProducts}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 14,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: '#fff',
                      cursor: 'pointer',
                      fontWeight: 900,
                    }}
                  >
                    รีเฟรช
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 14, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, borderTopLeftRadius: 14 }}>รูป</th>
                      <th style={th}>ชื่อสินค้า</th>
                      <th style={th}>ราคา</th>
                      <th style={th}>Stock</th>
                      <th style={{ ...th, borderTopRightRadius: 14, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((p, idx) => (
                      <tr key={p.id} style={{ background: idx % 2 === 0 ? '#fff' : '#fff7f7' }}>
                        <td style={td}>
                          <div
                            style={{
                              width: 56,
                              height: 40,
                              borderRadius: 10,
                              overflow: 'hidden',
                              background: '#f2f2f2',
                              border: '1px solid rgba(0,0,0,0.06)',
                            }}
                          >
                            {p.image_url ? (
                              <img
                                src={p.image_url}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            ) : null}
                          </div>
                        </td>

                        <td style={{ ...td, fontWeight: 900 }}>{p.name}</td>
                        <td style={td}>{p.price} บาท</td>
                        <td style={td}>{p.stock}</td>

                        <td style={{ ...td, textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 10 }}>
                            <button
                              onClick={() => openEdit(p)}
                              style={{
                                height: 36,
                                padding: '0 14px',
                                borderRadius: 999,
                                border: 'none',
                                background: '#f4c430',
                                color: '#7a0c1d',
                                fontWeight: 900,
                                cursor: 'pointer',
                                boxShadow: '0 10px 16px rgba(0,0,0,0.08)',
                              }}
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              style={{
                                height: 36,
                                padding: '0 14px',
                                borderRadius: 999,
                                border: 'none',
                                background: '#d64545',
                                color: '#fff',
                                fontWeight: 900,
                                cursor: 'pointer',
                                boxShadow: '0 10px 16px rgba(0,0,0,0.08)',
                              }}
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ ...td, textAlign: 'center', padding: 20, opacity: 0.75 }}>
                          ไม่พบรายการที่ค้นหา
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div
          onClick={closeEdit}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'grid',
            placeItems: 'center',
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 100%)',
              background: '#fff',
              borderRadius: 18,
              padding: 18,
              boxShadow: '0 20px 50px rgba(0,0,0,0.20)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, color: '#7a0c1d', fontSize: 24, fontWeight: 900 }}>
                  ✏️ แก้ไขสินค้า
                </h2>
                <p style={{ margin: '6px 0 0', opacity: 0.75 }}>แก้ข้อมูลแล้วกด “บันทึก”</p>
              </div>
              <button
                onClick={closeEdit}
                style={{
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#fff',
                  borderRadius: 12,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="ชื่อสินค้า" style={inputStyle} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="ราคา" inputMode="numeric" style={inputStyle} />
                <input value={editStock} onChange={(e) => setEditStock(e.target.value)} placeholder="Stock" inputMode="numeric" style={inputStyle} />
              </div>

              <input value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="Image URL" style={inputStyle} />

              <div
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid rgba(0,0,0,0.08)',
                  height: 180,
                  background: '#fafafa',
                }}
              >
                {editImageUrl?.trim() ? (
                  <img
                    src={editImageUrl.trim()}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                ) : (
                  <div style={{ height: '100%', display: 'grid', placeItems: 'center', opacity: 0.6 }}>
                    ไม่มีรูป
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button
                  onClick={closeEdit}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 14,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 900,
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={async () => {
                    await saveEdit()
                  }}
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 14,
                    border: 'none',
                    background: loading ? '#ddd' : '#f4c430',
                    color: '#7a0c1d',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 900,
                  }}
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

const card: React.CSSProperties = {
  borderRadius: 18,
  background: '#fff',
  boxShadow: '0 12px 28px rgba(0,0,0,0.10)',
  border: '1px solid rgba(0,0,0,0.05)',
  padding: 18,
}

const inputStyle: React.CSSProperties = {
  height: 44,
  borderRadius: 14,
  border: '1px solid rgba(0,0,0,0.10)',
  padding: '0 12px',
  outline: 'none',
}

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '14px 12px',
  background: '#f4c430',
  color: '#7a0c1d',
  fontWeight: 900,
  position: 'sticky',
  top: 0,
  zIndex: 1,
  borderBottom: '1px solid rgba(0,0,0,0.08)',
}

const td: React.CSSProperties = {
  padding: '12px 12px',
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  verticalAlign: 'middle',
}
