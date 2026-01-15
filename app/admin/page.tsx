'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Product = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number
  stock: number
  image_url: string | null
  created_at: string
}

const emptyForm = {
  name: '',
  description: '',
  category: 'classic',
  price: 0,
  stock: 0,
  image_url: '',
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({ ...emptyForm })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string>('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setMsg('')
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setMsg(`Load error: ${error.message}`)
      return
    }
    setProducts((data as Product[]) || [])
  }

  function startEdit(p: Product) {
    setEditingId(p.id)
    setForm({
      name: p.name ?? '',
      description: p.description ?? '',
      category: p.category ?? 'classic',
      price: p.price ?? 0,
      stock: p.stock ?? 0,
      image_url: p.image_url ?? '',
    })
    setMsg('')
  }

  function resetForm() {
    setEditingId(null)
    setForm({ ...emptyForm })
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      if (!form.name.trim()) {
        setMsg('กรอกชื่อสินค้าก่อนนะ')
        return
      }

      if (editingId) {
        // UPDATE
        const { error } = await supabase
          .from('products')
          .update({
            name: form.name,
            description: form.description || null,
            category: form.category || 'classic',
            price: Number(form.price),
            stock: Number(form.stock),
            image_url: form.image_url || null,
          })
          .eq('id', editingId)

        if (error) throw error
        setMsg('✅ แก้ไขสินค้าแล้ว')
      } else {
        // INSERT
        const { error } = await supabase.from('products').insert({
          name: form.name,
          description: form.description || null,
          category: form.category || 'classic',
          price: Number(form.price),
          stock: Number(form.stock),
          image_url: form.image_url || null,
        })

        if (error) throw error
        setMsg('✅ เพิ่มสินค้าแล้ว')
      }

      resetForm()
      await fetchProducts()
    } catch (err: any) {
      setMsg(`Save error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id: string) {
    const ok = confirm('ลบสินค้านี้แน่ใจไหม?')
    if (!ok) return

    setLoading(true)
    setMsg('')
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setMsg('🗑️ ลบสินค้าแล้ว')
      await fetchProducts()
    } catch (err: any) {
      setMsg(`Delete error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🛠️ Admin — Products</h1>
        <a href="/" style={{ textDecoration: 'underline' }}>ไปหน้าร้าน</a>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <section style={{ marginTop: 16, padding: 16, border: '1px solid #ddd' }}>
        <h2 style={{ marginBottom: 12 }}>
          {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
        </h2>

        <form onSubmit={submitForm} style={{ display: 'grid', gap: 10 }}>
          <input
            placeholder="ชื่อสินค้า"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="ลิงก์รูป (image_url)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />

          <input
            placeholder="หมวด (classic/dark/milk/matcha/gift)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            placeholder="ราคา"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />

          <input
            placeholder="สต็อก"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />

          <textarea
            placeholder="รายละเอียด"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading}>
              {editingId ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={resetForm} disabled={loading}>
              Clear
            </button>
            <button type="button" onClick={fetchProducts} disabled={loading}>
              Refresh
            </button>
          </div>
        </form>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>รายการสินค้า</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 12 }}>
          {products.map((p) => (
            <div key={p.id} style={{ border: '1px solid #ddd', padding: 12 }}>
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: 160, background: '#f3f3f3', display: 'grid', placeItems: 'center' }}>
                  no image
                </div>
              )}

              <h3 style={{ marginTop: 10 }}>{p.name}</h3>
              <p>{p.price} บาท • Stock: {p.stock}</p>
              <p style={{ opacity: 0.7 }}>{p.category}</p>

              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => startEdit(p)} disabled={loading}>Edit</button>
                <button onClick={() => deleteProduct(p.id)} disabled={loading}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
