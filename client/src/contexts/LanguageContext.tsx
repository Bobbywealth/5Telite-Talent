import { createContext, useContext, useState } from "react";

type Language = "en" | "es" | "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    dashboard: "Dashboard",
    bookings: "Bookings",
    profile: "Profile",
    settings: "Settings",
    welcome: "Welcome back",
    totalBookings: "Total Bookings",
    activeProjects: "Active Projects",
    totalSpent: "Total Spent",
    completed: "Completed",
    recentBookings: "Recent Bookings",
    quickActions: "Quick Actions",
    myTasks: "My Tasks",
    createBooking: "Create Booking",
    findTalent: "Find Talent",
    manageBookings: "Manage Bookings",
    noBookings: "No bookings yet",
    noTasks: "No active tasks",
    switchTheme: "Switch Theme",
    changeLanguage: "Change Language",
    updateTimezone: "Update Timezone",
  },
  es: {
    dashboard: "Panel",
    bookings: "Reservas",
    profile: "Perfil",
    settings: "Configuración",
    welcome: "Bienvenido de nuevo",
    totalBookings: "Reservas Totales",
    activeProjects: "Proyectos Activos",
    totalSpent: "Total Gastado",
    completed: "Completado",
    recentBookings: "Reservas Recientes",
    quickActions: "Acciones Rápidas",
    myTasks: "Mis Tareas",
    createBooking: "Crear Reserva",
    findTalent: "Buscar Talento",
    manageBookings: "Gestionar Reservas",
    noBookings: "No hay reservas aún",
    noTasks: "No hay tareas activas",
    switchTheme: "Cambiar Tema",
    changeLanguage: "Cambiar Idioma",
    updateTimezone: "Actualizar Zona Horaria",
  },
  fr: {
    dashboard: "Tableau de bord",
    bookings: "Réservations",
    profile: "Profil",
    settings: "Paramètres",
    welcome: "Bon retour",
    totalBookings: "Réservations Totales",
    activeProjects: "Projets Actifs",
    totalSpent: "Total Dépensé",
    completed: "Terminé",
    recentBookings: "Réservations Récentes",
    quickActions: "Actions Rapides",
    myTasks: "Mes Tâches",
    createBooking: "Créer Réservation",
    findTalent: "Trouver Talent",
    manageBookings: "Gérer Réservations",
    noBookings: "Pas encore de réservations",
    noTasks: "Pas de tâches actives",
    switchTheme: "Changer de Thème",
    changeLanguage: "Changer de Langue",
    updateTimezone: "Mettre à jour Fuseau Horaire",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}