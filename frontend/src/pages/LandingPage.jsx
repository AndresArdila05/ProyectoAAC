import React from "react"
import Layout from "../components/Layout.jsx"

const LandingPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-300">
          Visualizador de Aritmética en Base&nbsp;<span className="text-white">b</span>
        </h2>
        <p className="text-base md:text-lg text-gray-400 mt-4 px-4 md:px-0">
          Aprende paso a paso cómo funcionan las operaciones básicas en diferentes bases numéricas. Algoritmos basados en el libro de Lamanga.
        </p>

        <img
          src="/src/assets/LandingPic.png" // Cambia esto si tu imagen está en otro lugar
          alt="Aritmética visual"
          className="mt-8 w-full max-w-3xl rounded-xl shadow-lg border border-gray-700"
        />

      </div>
    </Layout>
  )
}

export default LandingPage

