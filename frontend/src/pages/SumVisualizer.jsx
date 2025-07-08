import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";

// --- Componente para mostrar un arreglo de dígitos (sin cambios) ---
function ArrayDisplay({ label, array, highlight }) {
  const reversed = array.slice().reverse()
  const reversedIndex = i => array.length - 1 - i

  return (
    <div className="flex items-center space-x-2 justify-end">
      {label && <span className="font-mono text-sm text-gray-400 w-24 text-right pr-2">{label}:</span>}
      {reversed.map((val, idx) => (
        <motion.span
          key={idx}
          initial={{ scale: 0.8 }}
          animate={{ scale: highlight === reversedIndex(idx) ? 1.15 : 1, y: highlight === reversedIndex(idx) ? -3 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          className={`w-10 h-10 flex items-center justify-center rounded text-lg font-mono border transition-all ${
            highlight === reversedIndex(idx)
              ? "bg-green-600 text-white border-green-400"
              : "bg-gray-700 border-gray-600"
          }`}
        >
          {val === null ? "" : val}
        </motion.span>
      ))}
    </div>
  )
}

// --- Componente Principal ---
export default function SumVisualizer() {
  const [u, setU] = useState("")
  const [v, setV] = useState("")
  const [base, setBase] = useState(10)
  const [data, setData] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  const fetchSteps = async () => {
    try {
      const payload = { u: Number(u), v: Number(v), base: Number(base) }
      const res = await fetch("http://localhost:8000/suma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      setData(json)
      setCurrentStep(0)
    } catch (err) {
      alert("Failed to connect to backend")
    }
  }

  const nextStep = () => {
    if (data && currentStep < data.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (data && currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const vizData = useMemo(() => {
    if (!data) return null;
    const currentPaso = data.steps[currentStep];
    const carrys = data.steps.map(s => s.carry_in);
    // Añadir el acarreo final si existe en el último paso
    if (data.steps[data.steps.length -1].carry_out > 0) {
        carrys.push(data.steps[data.steps.length -1].carry_out);
    }

    return {
        ...data,
        currentPaso,
        result_in_step: currentPaso.result,
        carrys,
        isFinalStep: currentStep === data.steps.length - 1,
    }
  }, [data, currentStep]);

  return (
    <Layout>
      <div className="text-white px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
            Suma paso a paso en base <span className="text-blue-400">{base}</span>
          </h1>

          {/* Formulario (sin cambios) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <input type="number" value={u} onChange={e => setU(e.target.value)} placeholder="u (decimal)"
              className="bg-gray-800 border border-gray-600 rounded px-4 py-2" />
            <input type="number" value={v} onChange={e => setV(e.target.value)} placeholder="v (decimal)"
              className="bg-gray-800 border border-gray-600 rounded px-4 py-2" />
            <input type="number" value={base} onChange={e => setBase(e.target.value)} placeholder="Base"
              className="bg-gray-800 border border-gray-600 rounded px-4 py-2" />
          </div>
          <div className="text-center mb-6">
            <button onClick={fetchSteps}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold transition-all">
              Calcular
            </button>
          </div>

          <AnimatePresence>
            {vizData && (
              <motion.div
                key="visualizer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gray-800 p-6 rounded-xl shadow-md space-y-6"
              >
                <div className="flex justify-center">
                    <div className="inline-flex flex-col items-end">
                        {/* Acarreos (Carrys) */}
                        <ArrayDisplay label="Acarreo" array={vizData.carrys} highlight={currentStep + 1} />
                        
                        {/* Operandos */}
                        <ArrayDisplay label="u" array={vizData.u_digits} highlight={currentStep} />
                        <div className="flex items-center">
                            <span className="font-mono text-2xl text-green-400 pr-2">+</span>
                            <ArrayDisplay array={vizData.v_digits} highlight={currentStep} />
                        </div>
                        <div className="w-full border-t-2 border-gray-400 my-2"></div>
                        
                        {/* Resultado Acumulativo */}
                        <ArrayDisplay array={vizData.result_in_step} highlight={currentStep} />
                    </div>
                </div>
                
                {/* Resumen del paso */}
                <p className="mt-4 text-center text-yellow-400 italic text-lg">
                  {vizData.currentPaso.Resumen || vizData.currentPaso.summary}
                </p>

                {/* Navegación */}
                <div className="flex justify-center space-x-4 mt-6">
                  <button onClick={prevStep} disabled={currentStep === 0}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded disabled:opacity-40">← Anterior</button>
                  <button onClick={nextStep} disabled={vizData.isFinalStep}
                    className="bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded disabled:opacity-40">Siguiente →</button>
                </div>

                {/* Info final */}
                {vizData.isFinalStep && (
                    <div className="mt-6 text-center bg-gray-900 p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-green-400">Suma Completa</h3>
                        <div className="flex justify-center gap-8 items-start mt-3 font-mono">
                            <div className="text-center">
                                <p className="mb-2">Resultado (Base {vizData.base})</p>
                                <ArrayDisplay array={vizData.result_digits} />
                            </div>
                            <div className="text-center">
                                <p className="mb-2">Resultado (Base 10)</p>
                                <p className="text-2xl font-bold text-white h-10 flex items-center justify-center">
                                    {vizData.result_decimal}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  )
}