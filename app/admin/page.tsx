'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  description?: string | null
  category?: string | null
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
  const [description, setDescription] = useState('') // ✅ NEW
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [category, setCategory] = useState('') // (ถ้าไม่ใช้ ปล่อยว่างได้)

  // Edit modal
  const [editing, setEditing] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('') // ✅ NEW
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editCategory, setEditCategory] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      alert('โหลดสินค้าไม่สำเร็จ: ' + error.message)
      return
    }
    setProducts((data as Product[]) || [])
  }

  const filtered = useMemo(() => {
    const keyword = q.trim().toLowerCase()
    if (!keyword) return products
    return products.filter((p) => {
      const hay = [
        p.name,
        p.description,
        p.category,
        String(p.price ?? ''),
        String(p.stock ?? ''),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(keyword)
    })
  }, [q, products])

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
        description: description.trim() ? description.trim() : null, // ✅ NEW
        category: category.trim() ? category.trim() : null,
        price: p,
        stock: s,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
      },
    ])
    setLoading(false)

    if (error) return alert('เพิ่มสินค้าไม่สำเร็จ: ' + error.message)

    setName('')
    setDescription('') // ✅ NEW
    setCategory('')
    setPrice('')
    setStock('')
    setImageUrl('')
    await loadProducts()
    alert('เพิ่มสินค้าแล้ว ✅')
  }

  function openEdit(p: Product) {
    setEditing(p)
    setEditName(p.name ?? '')
    setEditDescription(p.description ?? '') // ✅ NEW
    setEditCategory(p.category ?? '')
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
        description: editDescription.trim() ? editDescription.trim() : null, // ✅ NEW
        category: editCategory.trim() ? editCategory.trim() : null,
        price: p,
        stock: s,
        image_url: editImageUrl.trim() ? editImageUrl.trim() : null,
      })
      .eq('id', editing.id)

    setLoading(false)

    if (error) return alert('แก้ไขไม่สำเร็จ: ' + error.message)

    closeEdit()
    await loadProducts()
    alert('บันทึกการแก้ไขแล้ว ✅')
  }

  async function deleteProduct(id: string) {
    const ok = confirm('ลบสินค้านี้แน่ใจไหม?')
    if (!ok) return

    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return alert('ลบไม่สำเร็จ: ' + error.message)

    await loadProducts()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#fde9ea', // แดงอ่อน
        fontFamily: 'system-ui',
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          background: '#7a0c1d', // แถบแดงบน
          color: '#fff',
          padding: '18px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 26 }}>🍫</span>
              <h1 style={{ margin: 0, fontSize: 34, letterSpacing: 0.2 }}>
                Chocolate Shop — Admin
              </h1>
            </div>
            <p style={{ margin: '6px 0 0', opacity: 0.9 }}>
              เพิ่ม / ลบ / แก้ไข สินค้า 
            </p>
          </div>

          <a
            href="/"
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              background: '#f5c542', // ปุ่มเหลือง
              color: '#5b0a15',
              textDecoration: 'none',
              fontWeight: 900,
              whiteSpace: 'nowrap',
              boxShadow: '0 10px 18px rgba(0,0,0,0.18)',
            }}
          >
            ← กลับหน้าร้าน
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '18px auto 0', padding: '0 18px' }}>
        {/* ADD FORM */}
        <section
          style={{
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            padding: 18,
          }}
        >
          <h2 style={{ margin: 0, color: '#7a0c1d', fontSize: 28 }}>
            ➕ เพิ่มสินค้าใหม่
          </h2>
          <p style={{ margin: '8px 0 16px', opacity: 0.7 }}>
            Image URL ควรเป็นลิงก์รูปตรง (.jpg/.png) เพื่อโชว์รูปได้
          </p>

          <form onSubmit={addProduct} style={{ display: 'grid', gap: 12 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr',
                gap: 12,
              }}
            >
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อสินค้า"
                style={inputStyle}
              />
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="ราคา (บาท)"
                inputMode="numeric"
                style={inputStyle}
              />
            </div>

            {/* ✅ NEW: description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายสินค้า (description)"
              style={{
                ...inputStyle,
                height: 90,
                paddingTop: 10,
                resize: 'vertical',
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '0.6fr 1.4fr',
                gap: 12,
              }}
            >
              <input
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
                inputMode="numeric"
                style={inputStyle}
              />
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Image URL"
                style={inputStyle}
              />
            </div>

            {/* category (ถ้าไม่ใช้ ไม่เป็นไร) */}
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="หมวดหมู่ (เช่น classic / matcha / gift)"
              style={inputStyle}
            />

            <button
              disabled={loading}
              style={{
                height: 46,
                borderRadius: 12,
                border: 'none',
                fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading ? '#ddd' : '#f5c542',
                color: '#5b0a15',
              }}
            >
              {loading ? 'กำลังทำงาน...' : 'เพิ่มสินค้า'}
            </button>
          </form>
        </section>

        {/* TABLE */}
        <section
          style={{
            marginTop: 18,
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              borderBottom: '1px solid #eee',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 26 }}>📋 รายการสินค้า</h2>
              <p style={{ margin: '6px 0 0', opacity: 0.7 }}>
                แสดง {filtered.length} / ทั้งหมด {products.length}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ค้นหาชื่อ/คำอธิบาย/ราคา/stock..."
                style={{ ...inputStyle, width: 320 }}
              />
              <button
                onClick={loadProducts}
                style={{
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid #eee',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                รีเฟรช
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5c542', color: '#5b0a15' }}>
                  <th style={th}>รูป</th>
                  <th style={th}>ชื่อสินค้า</th>
                  <th style={th}>คำอธิบาย</th> {/* ✅ NEW */}
                  <th style={th}>หมวด</th>
                  <th style={th}>ราคา</th>
                  <th style={th}>Stock</th>
                  <th style={{ ...th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={td}>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: 'cover',
                            borderRadius: 12,
                            border: '1px solid #eee',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: '#f3f3f3',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 12,
                            opacity: 0.7,
                          }}
                        >
                          ไม่มีรูป
                        </div>
                      )}
                    </td>

                    <td style={{ ...td, fontWeight: 900 }}>{p.name}</td>

                    {/* ✅ NEW */}
                    <td style={{ ...td, maxWidth: 520, color: '#333' }}>
                      {p.description ? (
                        <span style={{ opacity: 0.9 }}>{p.description}</span>
                      ) : (
                        <span style={{ opacity: 0.5 }}>—</span>
                      )}
                    </td>

                    <td style={td}>{p.category ?? '—'}</td>
                    <td style={td}>{p.price} บาท</td>
                    <td style={td}>{p.stock}</td>

                    <td style={{ ...td, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 10 }}>
                        <button
                          onClick={() => openEdit(p)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 999,
                            border: 'none',
                            background: '#f5c542',
                            color: '#5b0a15',
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 999,
                            border: 'none',
                            background: '#d64545',
                            color: '#fff',
                            fontWeight: 900,
                            cursor: 'pointer',
                          }}
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div style={{ padding: 16, opacity: 0.7 }}>
              ยังไม่มีสินค้า — เพิ่มจากฟอร์มด้านบนได้เลย
            </div>
          )}
        </section>
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
              width: 'min(720px, 100%)',
              background: '#fff',
              borderRadius: 18,
              padding: 18,
              boxShadow: '0 20px 50px rgba(0,0,0,0.20)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: '#7a0c1d' }}>
                  ✏️ แก้ไขสินค้า
                </h2>
                <p style={{ margin: '6px 0 0', opacity: 0.7 }}>
                  แก้ข้อมูลแล้วกด “บันทึก”
                </p>
              </div>
              <button
                onClick={closeEdit}
                style={{
                  border: '1px solid #eee',
                  background: '#fff',
                  borderRadius: 12,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="ชื่อสินค้า"
                style={inputStyle}
              />

              {/* ✅ NEW: edit description */}
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="คำอธิบายสินค้า (description)"
                style={{
                  ...inputStyle,
                  height: 100,
                  paddingTop: 10,
                  resize: 'vertical',
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                }}
              >
                <input
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="ราคา"
                  inputMode="numeric"
                  style={inputStyle}
                />
                <input
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  placeholder="Stock"
                  inputMode="numeric"
                  style={inputStyle}
                />
              </div>

              <input
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="Image URL"
                style={inputStyle}
              />

              <input
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="หมวดหมู่ (classic / matcha / gift)"
                style={inputStyle}
              />

              <div
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid #eee',
                  height: 180,
                  background: '#fafafa',
                }}
              >
                {editImageUrl?.trim() ? (
                  <img
                    src={editImageUrl.trim()}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                      opacity: 0.6,
                    }}
                  >
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
                    borderRadius: 12,
                    border: '1px solid #eee',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 900,
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={saveEdit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 12,
                    border: 'none',
                    background: loading ? '#ddd' : '#f5c542',
                    color: '#5b0a15',
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

const inputStyle: React.CSSProperties = {
  height: 42,
  borderRadius: 12,
  border: '1px solid #e9e6e6',
  padding: '0 12px',
  outline: 'none',
  background: '#fff',
}

const th: React.CSSProperties = {
  padding: '12px 12px',
  textAlign: 'left',
  fontWeight: 900,
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  padding: '12px 12px',
  verticalAlign: 'top',
}
