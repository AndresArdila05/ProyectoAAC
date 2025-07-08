import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout'; // Asegúrate de que la ruta sea correcta

// --- Componente para mostrar los dígitos de un número ---
function ArrayDigits({ array, faded = false, highlightRange = null, base = 10 }) {
    if (!array || array.length === 0) return <div className="h-10"></div>;
    const reversedArray = [...array].reverse();
    const isHighlighted = (visualIndex) => {
        if (!highlightRange) return false;
        const originalIndex = array.length - 1 - visualIndex;
        return originalIndex >= highlightRange.start && originalIndex < highlightRange.end;
    };
    return (
        <div className="flex space-x-1" lang="en">
            {reversedArray.map((digit, idx) => {
                const highlighted = isHighlighted(idx);
                return (
                    <motion.div key={idx} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl font-mono border-2 ${faded ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-gray-800 border-gray-600 text-white'} ${highlighted ? '!bg-yellow-500 !border-yellow-400 !text-black font-bold' : ''}`}>
                        {digit.toString(base).toUpperCase()}
                    </motion.div>
                );
            })}
        </div>
    );
}

// --- Componente para un solo paso de resta ---
function SubtractionStep({ paso, resultLine, base, uDisplayLength }) {
    const digitBoxWidthRem = 2.75;
    const uTildeEndIndexVisual = uDisplayLength - 1 - paso.j;
    const anchorRightEdgePosition = (uTildeEndIndexVisual + 1) * digitBoxWidthRem;
    const productWidth = paso.producto_final.length * digitBoxWidthRem;
    const marginLeftRem = anchorRightEdgePosition - productWidth;

    return (
        <div className="flex flex-col" style={{ marginLeft: `${marginLeftRem}rem` }}>
            <ArrayDigits array={paso.producto_final} faded={true} base={base} />
            <div className="border-t border-gray-500 my-1" style={{ width: `${productWidth}rem` }}></div>
            <ArrayDigits array={resultLine} faded={true} base={base} highlightRange={{ start: 0, end: resultLine.length }} />
        </div>
    );
}

// --- Componente para mostrar los ajustes del cociente ---
function StepTests({ paso, base }) {
    if (!paso || !paso.ajustes) return null;
    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-white mb-3">Pruebas de cociente (j={paso.j})</h3>
            <div className="space-y-3">
                {paso.ajustes.map((ajuste, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="flex items-center space-x-4 p-3 bg-gray-800 rounded-md">
                        <span className="text-sm font-mono text-gray-400">Intento {index + 1}:</span>
                        <span className="font-mono text-white">q' = <span className="text-cyan-400 font-bold">{ajuste.q_i.toString(base).toUpperCase()}</span></span>
                        <div className="flex-grow flex items-center space-x-2 font-mono text-white">
                            <span>Producto:</span><ArrayDigits array={ajuste.producto} base={base} />
                        </div>
                        <span className={`font-bold text-lg ${ajuste.comparacion > 0 ? 'text-red-500' : 'text-green-500'}`}>{ajuste.comparacion > 0 ? '>' : '≤'}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// --- Componente Principal ---
export default function DivisionVisualizer() {
    const [u, setU] = useState("87892");
    const [v, setV] = useState("255");
    const [base, setBase] = useState(10);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    const fetchSteps = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/division', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ u: parseInt(u, 10), v: parseInt(v, 10), base: parseInt(base, 10) }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(`Error ${response.status}: ${errData.detail || 'Error en la respuesta del servidor.'}`);
            }
            const result = await response.json();
            if (!result.pasos || result.pasos.length === 0) {
                setData({ ...result, q: result.resultado.cociente_array, r: result.resultado.residuo, pasos: [{ j: 0, u_tilde: result.preprocesamiento.u_base_b, ajustes: [], producto_final: [0], resto_parcial: result.resultado.residuo }] });
            } else {
                setData({ ...result, q: result.resultado.cociente_array, r: result.resultado.residuo });
            }
            setCurrentStep(0);
        } catch (err) {
            setError(err.message);
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => data && currentStep < data.pasos.length - 1 && setCurrentStep(currentStep + 1);
    const prevStep = () => currentStep > 0 && setCurrentStep(currentStep - 1);
    
    const vizData = useMemo(() => {
        if (!data) return null;
        const uDisplay = data.preprocesamiento.u_normalizado;
        const finalQuotient = data.q;
        const qDisplay = finalQuotient.slice(finalQuotient.length - (currentStep + 1));
        const j_start = data.pasos[0].j;
        const paddingBoxCount = uDisplay.length - 1 - j_start;
        const quotientPaddingRem = paddingBoxCount * 2.75;
        
        return {
            ...data,
            uDisplay,
            vDisplay: data.preprocesamiento.v_normalizado,
            qDisplay,
            quotientPaddingRem,
            stepsToRender: data.pasos.slice(0, currentStep + 1),
        };
    }, [data, currentStep]);

    return (
        <Layout>
            <div className="container mx-auto p-4 text-white">
                {/* Sección de Entradas */}
                <div className="bg-gray-900 p-6 rounded-xl shadow-lg max-w-4xl mx-auto space-y-4">
                    <h1 className="text-3xl font-bold text-center text-white">División Larga en base <span className="text-blue-400">{base}</span></h1>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-6">
                        <input type="text" value={u} onChange={e => setU(e.target.value)} placeholder="Dividendo (u)" className="bg-gray-800 border border-gray-600 rounded px-4 py-2"/>
                        <input type="text" value={v} onChange={e => setV(e.target.value)} placeholder="Divisor (v)" className="bg-gray-800 border border-gray-600 rounded px-4 py-2"/>
                        <input type="number" value={base} onChange={e => setBase(e.target.value)} placeholder="Base (b)" className="bg-gray-800 border border-gray-600 rounded px-4 py-2"/>
                  
                    </div>
                </div>

                <div className="text-center mb-8">
                  <button onClick={fetchSteps}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold transition-all">
                    Calcular
                  </button>
                </div>

                {error && <div className="text-red-500 bg-red-900/50 p-3 rounded-lg text-center mt-4 max-w-4xl mx-auto">{error}</div>}

                <AnimatePresence>
                    {vizData && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                            {/* Bloque de Normalización */}
                            {vizData.preprocesamiento.factor_escala_d > 1 && (
                                <div className="bg-gray-800 p-4 rounded-xl shadow-md max-w-5xl mx-auto mb-6">
                                    <h2 className="text-xl font-bold text-center text-gray-300 mb-3">⚙️ Normalización</h2>
                                    <div className="flex justify-around items-center text-center font-mono">
                                        <div><p className="text-sm text-gray-400">d</p><p className="text-2xl text-amber-400">{vizData.preprocesamiento.factor_escala_d}</p></div>
                                        <div><p className="text-sm text-gray-400">u * d</p><ArrayDigits array={vizData.preprocesamiento.u_normalizado} base={vizData.entrada.base}/></div>
                                        <div><p className="text-sm text-gray-400">v * d</p><ArrayDigits array={vizData.preprocesamiento.v_normalizado} base={vizData.entrada.base}/></div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Bloque Principal */}
                            <div className="bg-gray-800 p-6 rounded-xl shadow-md max-w-5xl mx-auto space-y-6">
                                {/* Visualización de la División */}
                                <div className="font-mono text-2xl overflow-x-auto pb-4">
                                    <div className="flex justify-center">
                                        <div className="inline-flex">
                                            <div className="pr-4 pt-16 mt-1.5">
                                                <ArrayDigits array={vizData.vDisplay} base={vizData.entrada.base} />
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="h-14 flex items-end" style={{ paddingLeft: `${vizData.quotientPaddingRem}rem` }}>
                                                    <ArrayDigits array={vizData.qDisplay} base={vizData.entrada.base} />
                                                </div>
                                                <div className="border-l-2 border-t-2 border-gray-400 pl-4 pt-2">
                                                    <div className="flex flex-col space-y-2">
                                                        {/* --- CAMBIO APLICADO AQUÍ --- */}
                                                        <ArrayDigits array={vizData.uDisplay} base={vizData.entrada.base} />
                                                        <AnimatePresence>
                                                            {vizData.stepsToRender.map((paso, index) => {
                                                                const isLastStep = index === vizData.pasos.length - 1;
                                                                const resultLine = isLastStep ? vizData.r : (vizData.pasos[index + 1] ? vizData.pasos[index + 1].u_tilde : []);
                                                                return (
                                                                    <motion.div key={paso.j} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                                                                        <SubtractionStep
                                                                            paso={paso}
                                                                            resultLine={resultLine}
                                                                            base={vizData.entrada.base}
                                                                            uDisplayLength={vizData.uDisplay.length}
                                                                        />
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Sección de Controles y otros campos */}
                                {vizData.pasos.length > 1 && (
                                    <>
                                        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg">
                                            <button onClick={prevStep} disabled={currentStep === 0} className="btn-secondary">Anterior</button>
                                            <span className="font-semibold text-center">Paso {currentStep + 1} / {vizData.pasos.length}<br/>(j = {vizData.pasos[currentStep]?.j})</span>
                                            <button onClick={nextStep} disabled={currentStep === vizData.pasos.length - 1} className="btn-secondary">Siguiente</button>
                                        </div>
                                        <AnimatePresence mode="wait">
                                            <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                                                <StepTests paso={vizData.pasos[currentStep]} base={vizData.entrada.base}/>
                                            </motion.div>
                                        </AnimatePresence>
                                    </>
                                )}
                                
                                {/* Sección de Resultado Final */}
                                {currentStep === vizData.pasos.length - 1 && (
                                    <div className="mt-6 text-center bg-gray-900 p-4 rounded-lg">
                                        <h3 className="text-xl font-bold text-green-400">🎉 ¡División Completa!</h3>
                                        {vizData.preprocesamiento.factor_escala_d > 1 && <p className="text-sm text-gray-400 mb-3">Resultado final des-normalizado</p>}
                                        <div className="flex justify-center gap-8 items-start mt-3 font-mono">
                                            <div className="text-center">
                                                <p className="mb-2">Cociente (q)</p>
                                                <ArrayDigits array={vizData.q} base={vizData.entrada.base}/>
                                                <p className="text-sm text-gray-400 mt-1">(Decimal: {vizData.resultado.cociente_decimal})</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="mb-2">Resto (r)</p>
                                                <ArrayDigits array={vizData.r} base={vizData.entrada.base}/>
                                                <p className="text-sm text-gray-400 mt-1">(Decimal: {vizData.resultado.residuo_decimal})</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
}

// Estilos
/*
.input-style { background-color: #1F2937; ... }
.btn-primary { background-color: #10B981; ... }
.btn-secondary { background-color: #374151; ... }
*/