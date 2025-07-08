import React, { useState, useMemo, useEffect } from 'react'; // Se añade useEffect
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';

// --- Componente para mostrar un arreglo de dígitos (sin cambios) ---
function ArrayDisplay({ label, array, highlight }) {
  const reversed = array.slice().reverse();
  const reversedIndex = i => array.length - 1 - i;

  return (
    <div className="flex items-center space-x-2 justify-center">
      {label && <span className="font-mono text-sm text-gray-400">{label}:</span>}
      {reversed.map((val, idx) => {
        const actualIndex = reversedIndex(idx);
        const isActive = highlight === actualIndex;
        return (
          <motion.span
            key={idx}
            initial={{ scale: 0.8 }}
            animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -3 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            className={`w-10 h-10 flex items-center justify-center rounded text-lg font-mono border transition-all ${
              isActive
                ? "bg-green-600 text-white border-green-400"
                : "bg-gray-700 border-gray-600"
            }`}
          >
            {val === null ? "" : val}
          </motion.span>
        );
      })}
    </div>
  );
}


// --- NUEVO: Componente para los controles de reproducción ---
function PlaybackControls({ isPlaying, togglePlay, speed, setSpeed, isFinalStep }) {
    return (
        <div className="flex items-center justify-center gap-6 bg-gray-900 p-3 rounded-lg">
            <button
                onClick={togglePlay}
                disabled={isFinalStep}
                className="bg-gray-600 hover:bg-gray-500 w-12 h-10 flex items-center justify-center rounded disabled:opacity-40 text-2xl"
            >
                {isPlaying ? '⏸️' : '▶️'}
            </button>
            <div className="flex items-center gap-2 text-sm">
                <span>Lento</span>
                <input
                    type="range"
                    min="200"
                    max="2000"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-40"
                />
                <span>Rápido</span>
            </div>
        </div>
    );
}


// --- Componente Principal ---
export default function MultiplicationVisualizer() {
  const [u, setU] = useState("");
  const [v, setV] = useState("");
  const [base, setBase] = useState(10);
  const [data, setData] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // --- NUEVOS ESTADOS para la reproducción automática ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // Velocidad inicial (1 segundo)


  const fetchSteps = async () => {
    setIsPlaying(false); // Detener la reproducción al buscar nuevos datos
    try {
      const payload = { u: Number(u), v: Number(v), base: Number(base) };
      const res = await fetch("http://localhost:8000/multiplicacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setData(json);
      setCurrentStep(0);
    } catch (err) {
      alert("Error conectando con el backend");
    }
  };

  const manualNextStep = () => {
    setIsPlaying(false); // Detener al usar los botones manuales
    if (data && currentStep < data.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const manualPrevStep = () => {
    setIsPlaying(false); // Detener al usar los botones manuales
    if (data && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const togglePlay = () => {
      // No iniciar si ya está en el último paso
      if (!isPlaying && data && currentStep === data.steps.length - 1) return;
      setIsPlaying(!isPlaying);
  }

  // --- LÓGICA DE REPRODUCCIÓN AUTOMÁTICA ---
  useEffect(() => {
    if (isPlaying) {
      // Si está en reproducción, crea un intervalo
      const interval = setInterval(() => {
        setCurrentStep(prevStep => {
          if (prevStep < data.steps.length - 1) {
            return prevStep + 1;
          } else {
            // Si llega al final, detiene la reproducción
            setIsPlaying(false);
            return prevStep;
          }
        });
      }, 2200 - speed); // Invertimos el valor del slider para que más sea más rápido

      // Limpia el intervalo si el componente se desmonta o isPlaying cambia
      return () => clearInterval(interval);
    }
  }, [isPlaying, speed, data]);


  const vizData = useMemo(() => {
    if (!data) return null;
    const currentPaso = data.steps[currentStep];
    return {
      u_digits: data.u_digits,
      v_digits: data.v_digits,
      result_in_step: currentPaso.result, 
      currentPaso,
      isFinalStep: currentStep === data.steps.length - 1,
      base: data.base,
      result_digits: data.result_digits,
      result_decimal: data.result_decimal,
      steps: data.steps,
    };
  }, [data, currentStep]);

  return (
    <Layout>
      <div className="min-h-screen text-white">
        <h1 className="text-3xl font-bold text-center mb-6">
          Multiplicación paso a paso en base <span className="text-blue-400">{base}</span>
        </h1>

        {/* Entradas (sin cambios) */}
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

        <AnimatePresence>
          {vizData && (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-800 p-6 rounded-xl shadow-md max-w-4xl mx-auto space-y-6"
            >
              <div className="flex flex-col items-center space-y-4">
                  <ArrayDisplay label="u" array={vizData.u_digits} highlight={vizData.currentPaso.j} />
                  <ArrayDisplay label="v" array={vizData.v_digits} highlight={vizData.currentPaso.i} />

                  <div className="w-full border-t-2 border-green-500 my-2"></div>
                  
                  <ArrayDisplay 
                    label="Resultado" 
                    array={vizData.result_in_step} 
                    highlight={vizData.currentPaso.j !== null ? vizData.currentPaso.i + vizData.currentPaso.j : null}
                  />
              </div>
              
              <p className="mt-4 text-center text-yellow-400 italic text-lg">
                {vizData.currentPaso.Resumen}
              </p>

              {/* --- NAVEGACIÓN ACTUALIZADA CON CONTROLES DE REPRODUCCIÓN --- */}
              <div className="flex justify-center space-x-4 mt-6">
                <button onClick={manualPrevStep} disabled={currentStep === 0}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded disabled:opacity-40">← Anterior</button>
                <PlaybackControls 
                    isPlaying={isPlaying}
                    togglePlay={togglePlay}
                    speed={speed}
                    setSpeed={setSpeed}
                    isFinalStep={vizData.isFinalStep}
                />
                <button onClick={manualNextStep} disabled={vizData.isFinalStep}
                  className="bg-gray-600 hover:bg-gray-500 px-4 py-1 rounded disabled:opacity-40">Siguiente →</button>
              </div>

              {/* Sección de Resultado Final (sin cambios) */}
              {vizData.isFinalStep && (
                  <div className="mt-6 text-center bg-gray-900 p-4 rounded-lg">
                      <h3 className="text-xl font-bold text-green-400">Multiplicación Completa</h3>
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
    </Layout>
  )
}