export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">AFDR Platform</h1>
        <p className="text-xl text-gray-600 mb-8">Plateforme de gestion AFDR</p>
        <div className="space-y-4">
          <p className="text-lg text-gray-500">Application déployée avec succès sur Vercel</p>
          <div className="mt-8">
            <a 
              href="/login" 
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Se connecter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

