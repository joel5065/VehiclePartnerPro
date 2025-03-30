import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const categories = [
    "Commandes et Livraison",
    "Paiement",
    "Produits et Garantie",
    "Compte et Sécurité",
  ];

  const faqItems: FAQItem[] = [
    {
      question: "Comment passer une commande ?",
      answer: "Réponse passer commande",
      category: "Commandes et Livraison",
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Réponse délais livraison",
      category: "Commandes et Livraison",
    },
    {
      question: "Comment suivre ma commande ?",
      answer: "Réponse suivre commande",
      category: "Commandes et Livraison",
    },
    {
      question: "Quels modes de paiement acceptez-vous ?",
      answer: "Réponse modes paiement",
      category: "Paiement",
    },
    {
      question: "Comment annuler une commande ?",
      answer: "Réponse annuler commande",
      category: "Commandes et Livraison",
    },
    {
      question: "Quelle est votre politique de retour ?",
      answer: "Réponse politique retour",
      category: "Produits et Garantie",
    },
    {
      question: "Comment vérifier la compatibilité d'une pièce avec mon véhicule ?",
      answer: "Réponse compatibilité pièce",
      category: "Produits et Garantie",
    },
    {
      question: "Quelle est la durée de la garantie ?",
      answer: "Réponse durée garantie",
      category: "Produits et Garantie",
    },
    {
      question: "Comment créer un compte ?",
      answer: "Réponse créer compte",
      category: "Compte et Sécurité",
    },
    {
      question: "Comment réinitialiser mon mot de passe ?",
      answer: "Réponse réinitialiser mot de passe",
      category: "Compte et Sécurité",
    },
    {
      question: "Comment mettre à jour mes informations personnelles ?",
      answer: "Réponse mettre à jour infos",
      category: "Compte et Sécurité",
    },
  ];

  const filteredItems = faqItems.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(item.answer).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{t("FAQ")}</h1>
      <p className="text-gray-600 mb-8">{t("Trouvez rapidement des réponses à vos questions")}</p>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder={t("Rechercher dans la FAQ")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("Catégories")}</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(
                selectedCategory === category ? null : category
              )}
            >
              {t(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg overflow-hidden"
          >
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              onClick={() => toggleItem(index)}
            >
              <span className="font-medium">{t(item.question)}</span>
              {expandedItems.includes(index) ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {expandedItems.includes(index) && (
              <div className="px-6 py-4 bg-gray-50">
                <p className="text-gray-600">{t(item.answer)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {t("Aucune question trouvée correspondant à votre recherche.")}
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQ; 