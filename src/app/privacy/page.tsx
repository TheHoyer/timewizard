import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polityka Prywatności - TimeWizard',
  description: 'Polityka prywatności aplikacji TimeWizard. Dowiedz się, jak chronimy Twoje dane.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Powrót do strony głównej
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Polityka Prywatności
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Wprowadzenie
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Witamy w TimeWizard. Twoja prywatność jest dla nas niezwykle ważna. Niniejsza Polityka 
              Prywatności wyjaśnia, w jaki sposób zbieramy, wykorzystujemy, przechowujemy i chronimy 
              Twoje dane osobowe podczas korzystania z naszej aplikacji do zarządzania czasem i zadaniami.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Korzystając z TimeWizard, wyrażasz zgodę na praktyki opisane w niniejszej Polityce Prywatności.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Jakie dane zbieramy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Zbieramy następujące rodzaje informacji:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li><strong>Dane konta:</strong> imię, adres e-mail, hasło (zaszyfrowane)</li>
              <li><strong>Dane zadań:</strong> tytuły, opisy, terminy, priorytety i kategorie Twoich zadań</li>
              <li><strong>Dane użytkowania:</strong> informacje o tym, jak korzystasz z aplikacji</li>
              <li><strong>Dane techniczne:</strong> adres IP, typ przeglądarki, system operacyjny</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Jak wykorzystujemy Twoje dane
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Twoje dane wykorzystujemy w następujących celach:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Świadczenie i ulepszanie naszych usług</li>
              <li>Personalizacja Twojego doświadczenia</li>
              <li>Wysyłanie powiadomień o zadaniach i terminach</li>
              <li>Komunikacja dotycząca Twojego konta</li>
              <li>Analiza i poprawa działania aplikacji</li>
              <li>Zapewnienie bezpieczeństwa usługi</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Ochrona danych
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Szyfrowanie danych w tranzycie (HTTPS) i w spoczynku</li>
              <li>Bezpieczne przechowywanie haseł z wykorzystaniem bcrypt</li>
              <li>Regularne aktualizacje zabezpieczeń</li>
              <li>Ograniczony dostęp do danych osobowych</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Twoje prawa (RODO)
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Zgodnie z RODO przysługują Ci następujące prawa:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li><strong>Prawo dostępu:</strong> możesz zażądać kopii swoich danych</li>
              <li><strong>Prawo do sprostowania:</strong> możesz poprawić nieprawidłowe dane</li>
              <li><strong>Prawo do usunięcia:</strong> możesz zażądać usunięcia swoich danych</li>
              <li><strong>Prawo do przenoszenia:</strong> możesz otrzymać swoje dane w formacie przenośnym</li>
              <li><strong>Prawo do sprzeciwu:</strong> możesz sprzeciwić się przetwarzaniu danych</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Pliki cookies
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Używamy plików cookies w celu:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Utrzymania sesji logowania</li>
              <li>Zapamiętania Twoich preferencji</li>
              <li>Analizy ruchu na stronie</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              Możesz kontrolować cookies poprzez ustawienia swojej przeglądarki.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Kontakt
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              W przypadku pytań dotyczących niniejszej Polityki Prywatności lub Twoich danych osobowych, 
              skontaktuj się z nami pod adresem:{' '}
              <a 
                href="mailto:privacy@timewizard.pl" 
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                privacy@timewizard.pl
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} TimeWizard. Wszystkie prawa zastrzeżone.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/terms" className="text-violet-600 dark:text-violet-400 hover:underline">
              Regulamin
            </Link>
            <Link href="/privacy" className="text-violet-600 dark:text-violet-400 hover:underline">
              Polityka Prywatności
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
