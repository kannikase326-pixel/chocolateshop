'use client'

import { useEffect, useState } from 'react'
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

    if (error) {
      alert('โหลดสินค้าไม่สำเร็จ: ' + error.message)
      return
    }
    setProducts((data as Product[]) || [])
  }

async function addProduct(e: React.FormEvent) {
  e.preventDefault()

  const p = Number(price)
  const s = Number(stock)

  if (!name.trim()) return alert('กรอกชื่อสินค้า')
  if (Number.isNaN(p) || p <= 0) return alert('ราคาต้องมากกว่า 0')
  if (Number.isNaN(s) || s < 0) return alert('Stock ต้องเป็น 0 ขึ้นไป')

  setLoading(true)

  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name: name.trim(),
        price: p,
        stock: s,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
      },
    ])
    .select() // ✅ ให้ตอบกลับมาด้วย

  console.log('ADD product result:', { data, error }) // ✅ ดูใน Console

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

  const { data, error } = await supabase
    .from('products')
    .update({
      name: editName.trim(),
      price: p,
      stock: s,
      image_url: editImageUrl.trim() ? editImageUrl.trim() : null,
    })
    .eq('id', editing.id)
    .select() // ✅ ให้ตอบกลับมาด้วย

  console.log('UPDATE product result:', { data, error }) // ✅ ดูใน Console

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
        padding: 28,
        background:
          'radial-gradient(1000px 500px at 20% 0%, rgba(122,12,29,0.10), transparent), #f8f5f5',
        fontFamily: 'system-ui',
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '18px 18px',
          borderRadius: 18,
          background: 'rgba(255,255,255,0.75)',
          boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🍫</span>
            <h1 style={{ margin: 0, color: '#7a0c1d', fontSize: 26 }}>
              Chocolate Shop — Admin
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', opacity: 0.75 }}>
            เพิ่ม / ลบ / แก้ไข สินค้า
          </p>
        </div>

        <a
          href="/"
          style={{
            padding: '10px 16px',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #a4161a, #7a0c1d)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 700,
            boxShadow: '0 10px 16px rgba(122,12,29,0.18)',
            whiteSpace: 'nowrap',
          }}
        >
          ← กลับหน้าเว็บ
        </a>
      </div>

      <div style={{ maxWidth: 1200, margin: '18px auto 0' }}>
        {/* ADD FORM */}
        <section
          style={{
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
            padding: 18,
          }}
        >
          <h2 style={{ margin: 0, color: '#7a0c1d' }}>➕ เพิ่มสินค้าใหม่</h2>
          <p style={{ margin: '8px 0 16px', opacity: 0.7 }}>
            Image URL ต้องเป็นลิงก์รูปตรง (.jpg/.png)
          </p>

          <form onSubmit={addProduct} style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 12 }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 1.4fr', gap: 12 }}>
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

            <button
              disabled={loading}
              style={{
                height: 44,
                borderRadius: 12,
                border: 'none',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                background: loading
                  ? '#ddd'
                  : 'linear-gradient(135deg, #a4161a, #7a0c1d)',
                color: '#fff',
                boxShadow: '0 12px 18px rgba(122,12,29,0.18)',
              }}
            >
              {loading ? 'กำลังทำงาน...' : 'เพิ่มสินค้า'}
            </button>
          </form>
        </section>

        {/* PRODUCT GRID */}
        <section style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <div>
              <h2 style={{ margin: 0 }}>📦 รายการสินค้า</h2>
              <p style={{ margin: '6px 0 0', opacity: 0.7 }}>
                มีทั้งหมด {products.length} รายการ
              </p>
            </div>
            <button
              onClick={loadProducts}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid #eee',
                background: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              รีเฟรช
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ height: 150, background: '#f3f3f3' }}>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
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

                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 900, fontSize: 16 }}>{p.name}</div>
                  <div style={{ marginTop: 6, opacity: 0.75 }}>
                    {p.price} บาท • Stock {p.stock}
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button
                      onClick={() => openEdit(p)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 12,
                        border: 'none',
                        background: 'linear-gradient(135deg, #a4161a, #7a0c1d)',
                        color: '#fff',
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      style={{
                        flex: 1,
                        height: 38,
                        borderRadius: 12,
                        border: 'none',
                        background: '#999',
                        color: '#fff',
                        fontWeight: 900,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div style={{ marginTop: 18, opacity: 0.7 }}>
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
              width: 'min(560px, 100%)',
              background: '#fff',
              borderRadius: 18,
              padding: 18,
              boxShadow: '0 20px 50px rgba(0,0,0,0.20)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, color: '#7a0c1d' }}>✏️ แก้ไขสินค้า</h2>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
                    height: 42,
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
                    height: 42,
                    borderRadius: 12,
                    border: 'none',
                    background: loading
                      ? '#ddd'
                      : 'linear-gradient(135deg, #a4161a, #7a0c1d)',
                    color: '#fff',
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
}
