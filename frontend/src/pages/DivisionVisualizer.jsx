import { useState } from "react"
import { motion } from "framer-motion"
import Layout from "../components/Layout"

export default function DivisionVisualizer() {
  const [u, setU] = useState("")
  const [v, setV] = useState("")
  const [base, setBase] = useState(10)
  const [data, setData] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  const fetchSteps = async () => {
    try {
      const payload = { u: Number(u), v: Number(v), base: Number(base) }
      const res = await fetch("http://localhost:8000/division", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setData(json)
      setCurrentStep(0)
    } catch (err) {
      alert("Error conectando con el backend")
    }
  }

  const nextStep = () => {
    if (data && currentStep < data.pasos.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (data && currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen text-white px-4">
        <h1 className="text-3xl font-bold text-center mb-6">
          División larga paso a paso en base <span className="text-blue-400">{base}</span>
        </h1>

        {/* Entradas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
          <input type="number" value={u} onChange={e => setU(e.target.value)} placeholder="u (decimal)"
            className="bg-gray-800 border border-gray-600 rounded px-4 py-2" />
          <input type="number" value={v} onChange={e => setV(e.target.value)} placeholder="v (decimal)"
            className="bg-gray-800 border border-gray-600 rounded px-4 py-2" />
          <input type="number" value={base} onChange={e => setBase(e.target.value)} placeholder="Base"
            className="bg-gray-800 border border-gray-600 rounded px-4 py-2" />
        </div>

        <div className="text-center mb-8">
          <button onClick={fetchSteps}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold transition-all">
            Calcular
          </button>
        </div>

        {data && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-md max-w-5xl mx-auto space-y-8">
            <div className="text-center text-lg font-semibold text-blue-300">Base: {data.entrada.base}</div>

            <div className="flex justify-center items-start font-mono">
              <div className="flex flex-col items-end pr-2">
                <ArrayDigits array={data.preprocesamiento.v_base_b} />
              </div>
              <div className="border-t-2 border-l-2 border-white pl-4 pt-1 ml-1">
                <div className="flex justify-end mb-2">
                  <ArrayDigits array={data.pasos[currentStep].cociente_parcial} />
                </div>
                <ArrayDigits array={data.preprocesamiento.u_base_b} />
                <ArrayDigits array={data.pasos[currentStep].producto_final} faded />
                <ArrayDigits array={data.pasos[currentStep].resto_parcial} faded />
              </div>
            </div>

            <StepTests paso={data.pasos[currentStep]} />

            <div className="flex justify-center space-x-4">
              <button onClick={prevStep} disabled={currentStep === 0}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded disabled:opacity-40">← Anterior</button>
              <button onClick={nextStep} disabled={currentStep === data.pasos.length - 1}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded disabled:opacity-40">Siguiente →</button>
            </div>

            <div className="mt-6 space-y-2 text-center text-sm text-gray-300">
              <p><strong>Cociente (base {data.entrada.base}):</strong> {data.resultado.cociente_str_base_b}</p>
              <p><strong>Residuo (base {data.entrada.base}):</strong> {data.resultado.residuo_str_base_b}</p>
              <p><strong>Cociente (decimal):</strong> {data.resultado.cociente_decimal}</p>
              <p><strong>Residuo (decimal):</strong> {data.resultado.residuo_decimal}</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

function ArrayDigits({ array, faded = false }) {
  if (!array) return null
  const reversed = array.slice().reverse()
  return (
    <div className="flex space-x-1">
      {reversed.map((val, idx) => (
        <motion.div
          key={idx}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`w-10 h-10 flex items-center justify-center rounded text-lg font-mono border ${
            faded ? 'bg-gray-700 border-gray-600 opacity-50' : 'bg-gray-700 border-gray-500'
          }`}
        >
          {val}
        </motion.div>
      ))}
    </div>
  )
}

function StepTests({ paso }) {
  return (
    <div className="bg-black p-4 rounded font-mono space-y-4 text-gray-300">
      <div className="text-lg text-yellow-300 font-semibold text-center">Paso j = {paso.j}</div>

      <div className="text-blue-400 font-semibold">q̂ estimado: {paso.q_i_estimado}</div>

      <div className="mt-2">
        <span className="text-green-400 font-semibold">Ajustes de q̂:</span>
        <ul className="mt-1 space-y-1 ml-4 list-disc text-sm">
          {paso.ajustes.map((a, i) => (
            <li key={i}>
              q = {a.q_i}, producto = [{a.producto.join(", ")}], comparación: {a.comparacion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
