import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamin - TimeWizard',
  description: 'Regulamin korzystania z aplikacji TimeWizard. Poznaj warunki korzystania z usługi.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      
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
            Regulamin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </div>
      </header>

      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Postanowienia ogólne
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Niniejszy Regulamin określa zasady korzystania z aplikacji TimeWizard, 
              która umożliwia inteligentne planowanie i zarządzanie zadaniami.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Korzystając z TimeWizard, akceptujesz warunki niniejszego Regulaminu. 
              Jeśli nie zgadzasz się z którymkolwiek z postanowień, prosimy o niekorzystanie z usługi.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Definicje
            </h2>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li><strong>Usługa</strong> - aplikacja TimeWizard dostępna przez przeglądarkę internetową</li>
              <li><strong>Użytkownik</strong> - osoba korzystająca z Usługi</li>
              <li><strong>Konto</strong> - indywidualne konto Użytkownika w Usłudze</li>
              <li><strong>Treść</strong> - wszelkie dane wprowadzane przez Użytkownika (zadania, notatki itp.)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Rejestracja i konto
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Aby korzystać z pełnej funkcjonalności TimeWizard, wymagane jest utworzenie konta.
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Musisz podać prawdziwe i aktualne informacje podczas rejestracji</li>
              <li>Jesteś odpowiedzialny za bezpieczeństwo swojego hasła</li>
              <li>Jedno konto może być używane tylko przez jedną osobę</li>
              <li>Możesz w każdej chwili usunąć swoje konto</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Plany i płatności
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              TimeWizard oferuje następujące plany:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li><strong>Free:</strong> Bezpłatny plan z podstawowymi funkcjami</li>
              <li><strong>Pro:</strong> Płatny plan z rozszerzonymi funkcjami</li>
              <li><strong>Team:</strong> Plan dla zespołów z funkcjami współpracy</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-400 mt-4">
              Płatności są przetwarzane przez bezpieczne systemy płatności online. 
              Subskrypcje odnawiają się automatycznie, chyba że zostaną anulowane przed końcem okresu rozliczeniowego.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Zasady korzystania
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Użytkownik zobowiązuje się do:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Korzystania z Usługi zgodnie z prawem</li>
              <li>Nienaruszania praw innych użytkowników</li>
              <li>Niepodejmowania działań szkodzących Usłudze</li>
              <li>Nierozsyłania spamu ani złośliwego oprogramowania</li>
              <li>Nieudostępniania swojego konta osobom trzecim</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Własność intelektualna
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              TimeWizard i wszystkie związane z nim materiały (logo, design, kod) 
              są własnością twórców aplikacji i są chronione prawem autorskim.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Treści tworzone przez Użytkownika pozostają jego własnością. 
              Udzielasz nam licencji na przechowywanie i przetwarzanie tych treści w celu świadczenia Usługi.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Ograniczenie odpowiedzialności
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              TimeWizard jest dostarczany &quot;tak jak jest&quot; bez żadnych gwarancji. 
              Nie ponosimy odpowiedzialności za:
            </p>
            <ul className="list-disc pl-6 text-slate-600 dark:text-slate-400 space-y-2">
              <li>Przerwy w działaniu Usługi</li>
              <li>Utratę danych spowodowaną czynnikami zewnętrznymi</li>
              <li>Szkody wynikające z korzystania lub niemożności korzystania z Usługi</li>
              <li>Działania osób trzecich</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              8. Zmiany w Regulaminie
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Zastrzegamy sobie prawo do modyfikacji niniejszego Regulaminu. 
              O istotnych zmianach będziemy informować użytkowników drogą e-mailową 
              z co najmniej 14-dniowym wyprzedzeniem. Kontynuowanie korzystania z Usługi 
              po wprowadzeniu zmian oznacza ich akceptację.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              9. Rozwiązanie umowy
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Możesz w każdej chwili zaprzestać korzystania z Usługi i usunąć swoje konto.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Zastrzegamy sobie prawo do zawieszenia lub usunięcia konta w przypadku 
              naruszenia niniejszego Regulaminu.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              10. Kontakt
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              W przypadku pytań dotyczących Regulaminu, skontaktuj się z nami:{' '}
              <a 
                href="mailto:legal@timewizard.pl" 
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                legal@timewizard.pl
              </a>
            </p>
          </section>
        </div>
      </main>

      
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
