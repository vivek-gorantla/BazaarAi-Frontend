"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  streamCustomerRequest,
  customerApi,
} from "@/services/customerApi";

import { useCart } from "../../contexts/CartContext";

import {
  ProductRecommendationDrawer,
  type RecommendedProduct,
} from "../../components/customer/ProductRecommendationDrawer";

import { MicroCartDrawer } from "../../components/customer/MicroCartDrawer";

import { MicroPaymentModal } from "../../components/customer/MicroPaymentModal";

/* =========================================================
   COLORS
========================================================= */

const PRIMARY = "#748F70";
const SECONDARY = "#F3B58C";

const SURFACE = "#141A15";
const SURFACE_C = "#1A231C";
const SURFACE_CH = "#243026";
const SURFACE_CHH = "#2E3D30";

const ON_SURFACE = "#F2F7F2";
const ON_SURFACE_VAR = "#C2D6C0";

/* =========================================================
   TYPES
========================================================= */

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  products?: RecommendedProduct[];
  timestamp: Date;
}

/* =========================================================
   AGENT RESPONSE PARSER
========================================================= */

function parseAgentResponse(res: any): {
  text: string;
  products: RecommendedProduct[];
  isCartUpdate: boolean;
  isCheckout: boolean;
} {
  let parsed = res;

  if (typeof res === "string") {
    try {
      const clean = res
        .replace(/```json\n?|```/g, "")
        .trim();

      parsed = JSON.parse(clean);
    } catch {
      const textLower = res.toLowerCase();

      const isCartUpdate =
        textLower.includes("added to cart") ||
        textLower.includes("cart updated");

      const isCheckout =
        textLower.includes("proceed to payment") ||
        textLower.includes("checkout") ||
        textLower.includes("payment modal");

      return {
        text: res,
        products: [],
        isCartUpdate,
        isCheckout,
      };
    }
  }

  if (
    typeof parsed !== "object" ||
    parsed === null
  ) {
    return {
      text: String(parsed),
      products: [],
      isCartUpdate: false,
      isCheckout: false,
    };
  }

  let text = "";
  let products: RecommendedProduct[] = [];

  let isCartUpdate = false;
  let isCheckout = false;

  const rawProducts =
    parsed.products ||
    parsed.items ||
    parsed.resolved_items ||
    parsed.recommendations ||
    parsed.discovery_response?.resolved_items ||
    parsed.recommendation_response?.items ||
    parsed.recommendation_response?.recommendations ||
    [];

  if (
    Array.isArray(rawProducts) &&
    rawProducts.length > 0
  ) {
    products = rawProducts.map((item: any) => ({
      id: String(
        item.productId ||
        item.id ||
        Math.random()
      ),

      name:
        item.name ||
        item.title ||
        "Product Item",

      price: Number(
        item.price ||
        item.estimated_price ||
        0
      ),

      unit:
        item.unit ||
        item.weight,

      image:
        item.imageUrl ||
        item.image,

      storeName:
        item.storeName ||
        item.store?.name ||
        "Local Merchant",

      storeId: item.storeId,

      category: item.category,
    }));
  }

  if (parsed.discovery_response) {
    text =
      parsed.discovery_response.message;
  } else if (parsed.recommendation_response) {
    text =
      parsed.recommendation_response.message;
  } else if (parsed.cart_response) {
    text =
      parsed.cart_response.message ||
      "Cart updated!";

    isCartUpdate = true;
  } else if (parsed.checkout_response) {
    text =
      parsed.checkout_response.message ||
      "Ready for checkout!";

    isCheckout = true;
  } else if (parsed.payment_response) {
    text =
      `Payment ${parsed.payment_response
        .payment_status || "initiated"
      }. Amount: ₹${parsed.payment_response
        .amount_processed || 0
      }.`;

    isCheckout = true;
  } else if (parsed.planning_response) {
    const plan =
      parsed.planning_response;

    text =
      `**Grocery Plan:** ${plan.occasion ||
      "Weekly Plan"
      }\n`;

    text +=
      `**People:** ${plan.people || "-"
      } | **Budget:** ₹${plan.budget || 0
      }\n`;

    if (
      plan.required_categories &&
      Array.isArray(
        plan.required_categories
      )
    ) {
      plan.required_categories.forEach(
        (cat: any) => {
          text +=
            `\n• **${cat.category}**: ` +
            `${cat.estimated_quantity} ` +
            `(₹${cat.allocated_budget})`;
        }
      );
    }
  } else if (parsed.message) {
    text = parsed.message;
  } else if (parsed.text) {
    text = parsed.text;
  } else {
    text = JSON.stringify(
      parsed,
      null,
      2
    );
  }

  if (!text) {
    text = "Here are the details:";
  }

  if (
    products.length > 0 &&
    !text.includes("products")
  ) {
    text +=
      ` I've opened a panel with ` +
      `**${products.length} recommended products** ` +
      `for you.`;
  }

  return {
    text,
    products,
    isCartUpdate,
    isCheckout,
  };
}

/* =========================================================
   RENDER TEXT
========================================================= */

function renderText(text: string) {
  return text
    .split("\n")
    .map((line, i) => {
      const boldLine =
        line.replace(
          /\*\*(.+?)\*\*/g,
          (_, m) =>
            `<strong>${m}</strong>`
        );

      return (
        <p
          key={i}
          style={{
            margin:
              i > 0
                ? "4px 0 0"
                : 0,
          }}
          dangerouslySetInnerHTML={{
            __html: boldLine,
          }}
        />
      );
    });
}

/* =========================================================
   QUICK PROMPTS
========================================================= */

const QUICK_PROMPTS = [
  {
    icon: "rice_bowl",
    label: "Basmati Rice & Staples",
    query:
      "Give basmati rice and cooking staples nearby",
  },

  {
    icon: "local_grocery_store",
    label: "Fresh Groceries",
    query:
      "Find fresh vegetables and fruits available near me",
  },

  {
    icon: "restaurant",
    label: "Weekly Meal Plan",
    query:
      "Help me plan and order groceries for a week for 4 people",
  },

  {
    icon: "local_offer",
    label: "Today's Best Deals",
    query:
      "What are the best deals and offers available today?",
  },
];

/* =========================================================
   VOICE INPUT
========================================================= */

function useVoiceInput() {
  const [isListening, setIsListening] =
    useState(false);

  const [isSupported, setIsSupported] =
    useState(false);

  const recognitionRef =
    useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ??
      (window as any)
        .webkitSpeechRecognition;

    setIsSupported(
      !!SpeechRecognition
    );

    if (SpeechRecognition) {
      const r =
        new SpeechRecognition();

      r.continuous = false;
      r.interimResults = true;
      r.lang = "en-IN";

      recognitionRef.current = r;
    }
  }, []);

  const startListening =
    useCallback(
      (
        onTranscript: (
          t: string
        ) => void,

        onFinal: (
          t: string
        ) => void
      ) => {
        const r =
          recognitionRef.current;

        if (!r) return;

        r.onresult = (
          event: any
        ) => {
          const transcript =
            Array.from(
              event.results
            )
              .map(
                (r: any) =>
                  r[0].transcript
              )
              .join("");

          onTranscript(
            transcript
          );

          if (
            event.results[
              event.results.length - 1
            ].isFinal
          ) {
            onFinal(
              transcript
            );
          }
        };

        r.onend = () =>
          setIsListening(false);

        r.onerror = () =>
          setIsListening(false);

        r.start();

        setIsListening(true);
      },
      []
    );

  const stopListening =
    useCallback(() => {
      recognitionRef.current?.stop();
      setIsListening(false);
    }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}

/* =========================================================
   MAIN CHAT PAGE
========================================================= */

export default function CustomerChatPage() {
  const { refreshCart } =
    useCart();

  /* -------------------------------------------------------
     MESSAGE STATE
  ------------------------------------------------------- */

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: 1,

        text:
          "Hey there! 👋 I'm your **Bazaar AI Shopper**. " +
          "I can help you find groceries, recommend products, " +
          "update your cart, and process voice orders — just talk to me!",

        sender: "bot",

        timestamp: new Date(),
      },
    ]);

  const [input, setInput] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const [showQuickPrompts, setShowQuickPrompts] =
    useState(true);

  /* -------------------------------------------------------
     DRAWER / MODAL STATE
  ------------------------------------------------------- */

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [drawerProducts, setDrawerProducts] =
    useState<
      RecommendedProduct[]
    >([]);

  const [microCartOpen, setMicroCartOpen] =
    useState(false);

  const [paymentModalOpen, setPaymentModalOpen] =
    useState(false);

  /* -------------------------------------------------------
     REFS
  ------------------------------------------------------- */

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  /*
   * IMPORTANT:
   *
   * This prevents the initial render from
   * automatically scrolling to the bottom.
   */
  const hasInitializedChat =
    useRef(false);

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceInput();

  /* -------------------------------------------------------
     AUTO SCROLL
  ------------------------------------------------------- */

  useEffect(() => {
    /*
     * Do NOT scroll when the chat first opens.
     *
     * This keeps:
     * - Welcome message
     * - Quick suggestions
     *
     * visible initially.
     */

    if (
      !hasInitializedChat.current
    ) {
      hasInitializedChat.current =
        true;

      return;
    }

    /*
     * From the second render onward,
     * scroll to the newest message.
     */

    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "end",
        }
      );
    });
  }, [messages]);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage =
    useCallback(
      async (text: string) => {
        if (!text.trim()) return;

        const lowerText =
          text.toLowerCase();

        /* ---------------------------------------------------
           DIRECT PAYMENT COMMAND
        --------------------------------------------------- */

        if (
          lowerText.includes(
            "proceed to payment"
          ) ||
          lowerText.includes(
            "pay now"
          ) ||
          lowerText.includes(
            "checkout"
          )
        ) {
          setPaymentModalOpen(
            true
          );
        }

        /* ---------------------------------------------------
           BUILD CHAT HISTORY
        --------------------------------------------------- */

        const history =
          messages
            .filter(
              (m) => m.id !== 1
            )
            .map((m) => ({
              role:
                m.sender ===
                  "user"
                  ? "user"
                  : "assistant",

              content: m.text,
            }));

        /* ---------------------------------------------------
           CREATE USER MESSAGE
        --------------------------------------------------- */

        const userMsg: Message = {
          id: Date.now(),

          text: text.trim(),

          sender: "user",

          timestamp: new Date(),
        };

        setMessages(
          (prev) => [
            ...prev,
            userMsg,
          ]
        );

        setInput("");

        setIsTyping(true);

        setShowQuickPrompts(
          false
        );

        try {
          /* -----------------------------------------------
             BOT MESSAGE
          ------------------------------------------------ */

          const botMsgId =
            Date.now() + 1;

          let accumulatedText =
            "";

          let finalProducts:
            RecommendedProduct[] =
            [];

          let finalCartUpdate =
            false;

          let finalCheckout =
            false;

          let firstChunkReceived =
            false;

          /* -----------------------------------------------
             STREAM RESPONSE
          ------------------------------------------------ */

          await streamCustomerRequest(
            userMsg.text,
            history,
            (chunk) => {
              /* -------------------------------------------
                 FIRST CHUNK
              ------------------------------------------- */

              if (
                !firstChunkReceived
              ) {
                setIsTyping(
                  false
                );

                firstChunkReceived =
                  true;

                setMessages(
                  (prev) => [
                    ...prev,

                    {
                      id: botMsgId,

                      text: "",

                      sender: "bot",

                      timestamp:
                        new Date(),
                    },
                  ]
                );
              }

              /* -------------------------------------------
                 ERROR
              ------------------------------------------- */

              if (chunk.error) {
                accumulatedText =
                  chunk.error;

                setMessages(
                  (prev) =>
                    prev.map(
                      (m) =>
                        m.id ===
                          botMsgId
                          ? {
                            ...m,

                            text:
                              chunk.error,
                          }
                          : m
                    )
                );

                return;
              }

              /* -------------------------------------------
                 TEXT STREAM
              ------------------------------------------- */

              if (
                chunk.textChunk
              ) {
                accumulatedText +=
                  chunk.textChunk;

                let displayString =
                  accumulatedText;

                /*
                 * Try JSON parsing if
                 * response looks like JSON.
                 */

                if (
                  accumulatedText
                    .trim()
                    .startsWith(
                      "{"
                    ) ||
                  accumulatedText
                    .trim()
                    .startsWith(
                      "```json"
                    )
                ) {
                  const parsed =
                    parseAgentResponse(
                      accumulatedText
                    );

                  displayString =
                    parsed.text;

                  if (
                    parsed.products &&
                    parsed.products
                      .length >
                    0
                  ) {
                    finalProducts =
                      parsed.products;
                  }

                  finalCartUpdate =
                    parsed.isCartUpdate;

                  finalCheckout =
                    parsed.isCheckout;
                } else {
                  /*
                   * Normal text streaming.
                   */

                  const parsed =
                    parseAgentResponse(
                      accumulatedText
                    );

                  displayString =
                    parsed.text;

                  finalCartUpdate =
                    finalCartUpdate ||
                    parsed.isCartUpdate;

                  finalCheckout =
                    finalCheckout ||
                    parsed.isCheckout;
                }

                setMessages(
                  (prev) =>
                    prev.map(
                      (m) =>
                        m.id ===
                          botMsgId
                          ? {
                            ...m,

                            text:
                              displayString,
                          }
                          : m
                    )
                );
              }

              /* -------------------------------------------
                 PRODUCTS
              ------------------------------------------- */

              if (
                chunk.products
              ) {
                finalProducts =
                  chunk.products.map(
                    (item: any) => ({
                      id: String(
                        item.productId ||
                        item.id ||
                        Math.random()
                      ),

                      name:
                        item.name ||
                        item.title ||
                        "Product Item",

                      price: Number(
                        item.price ||
                        item.estimated_price ||
                        0
                      ),

                      unit:
                        item.unit ||
                        item.weight,

                      image:
                        item.imageUrl ||
                        item.image,

                      storeName:
                        item.storeName ||
                        item.store?.name ||
                        "Local Merchant",

                      storeId:
                        item.storeId,

                      category:
                        item.category,
                    })
                  );

                setMessages(
                  (prev) =>
                    prev.map(
                      (m) =>
                        m.id ===
                          botMsgId
                          ? {
                            ...m,

                            products:
                              finalProducts,
                          }
                          : m
                    )
                );
              }

              /* -------------------------------------------
                 STREAM COMPLETE
              ------------------------------------------- */

              if (
                chunk.done
              ) {
                /* -----------------------------------------
                   FALLBACK PRODUCT SEARCH
                ----------------------------------------- */

                if (
                  finalProducts.length ===
                  0
                ) {
                  const searchKeywords =
                    [
                      "rice",
                      "basmati",
                      "milk",
                      "vegetable",
                      "paneer",
                      "oil",
                      "bread",
                      "fruit",
                      "grocery",
                      "snack",
                      "item",
                      "product",
                      "buy",
                      "give",
                      "show",
                      "get",
                    ];

                  const isProductSearch =
                    searchKeywords.some(
                      (k) =>
                        lowerText.includes(
                          k
                        )
                    );

                  if (
                    isProductSearch
                  ) {
                    const queryTerm =
                      accumulatedText
                        .replace(
                          /give|show|buy|get|need|me|some|the|a|an/gi,
                          ""
                        )
                        .trim() ||
                      accumulatedText;

                    customerApi
                      .searchProducts({
                        q: queryTerm,
                      })
                      .then(
                        (searchRes) => {
                          if (
                            Array.isArray(
                              searchRes
                            ) &&
                            searchRes.length >
                            0
                          ) {
                            finalProducts =
                              searchRes.map(
                                (p: any) => ({
                                  id: p.id,

                                  name:
                                    p.title ||
                                    p.name,

                                  price: Number(
                                    p.price ||
                                    0
                                  ),

                                  unit:
                                    p.weight ||
                                    p.unit,

                                  image:
                                    p.imageUrl ||
                                    p.image,

                                  storeName:
                                    p.storeName ||
                                    "Nearby Store",

                                  category:
                                    p.category,
                                })
                              );

                            setMessages(
                              (prev) =>
                                prev.map(
                                  (m) =>
                                    m.id ===
                                      botMsgId
                                      ? {
                                        ...m,

                                        text:
                                          m.text +
                                          `\nI found **${finalProducts.length} matching products** for you!`,

                                        products:
                                          finalProducts,
                                      }
                                      : m
                                )
                            );

                            setDrawerProducts(
                              finalProducts
                            );

                            setDrawerOpen(
                              true
                            );
                          }
                        }
                      )
                      .catch((e) =>
                        console.warn(
                          e
                        )
                      );
                  }
                } else {
                  setDrawerProducts(
                    finalProducts
                  );

                  setDrawerOpen(
                    true
                  );
                }

                /* -----------------------------------------
                   CART
                ----------------------------------------- */

                if (
                  finalCartUpdate ||
                  lowerText.includes(
                    "add to cart"
                  ) ||
                  lowerText.includes(
                    "added to cart"
                  )
                ) {
                  setMicroCartOpen(
                    true
                  );
                }

                /* -----------------------------------------
                   PAYMENT
                ----------------------------------------- */

                if (
                  finalCheckout ||
                  lowerText.includes(
                    "proceed to payment"
                  ) ||
                  lowerText.includes(
                    "pay now"
                  )
                ) {
                  setPaymentModalOpen(
                    true
                  );
                }
              }
            }
          );

          /* -----------------------------------------------
             REFRESH CART
          ------------------------------------------------ */

          await refreshCart();
        } catch (err) {
          console.error(
            "Chat error:",
            err
          );

          setMessages(
            (prev) => [
              ...prev,

              {
                id:
                  Date.now() + 1,

                text:
                  "Sorry, I had trouble reaching the server. Please try again.",

                sender: "bot",

                timestamp:
                  new Date(),
              },
            ]
          );
        } finally {
          setIsTyping(false);
        }
      },
      [messages, refreshCart]
    );

  /* =========================================================
     VOICE HANDLER
  ========================================================= */

  const handleVoice = () => {
    if (isListening) {
      stopListening();
      return;
    }

    startListening(
      (interim) => {
        setInput(interim);
      },

      (final) => {
        setInput(final);

        setTimeout(() => {
          sendMessage(final);
        }, 300);
      }
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        /*
         * IMPORTANT:
         *
         * Parent CustomerMainWrapper
         * already controls the viewport height.
         */
        width: "100%",
        height: "100%",
        minHeight: 0,

        display: "flex",
        flexDirection: "column",

        position: "relative",

        background: SURFACE,

        overflow: "hidden",
      }}
    >
      {/* =====================================================
          AMBIENT BACKGROUND
      ===================================================== */}

      <div
        style={{
          position: "absolute",

          top: -100,
          left: -100,

          width: 400,
          height: 400,

          background:
            `radial-gradient(circle, ${PRIMARY}15 0%, transparent 70%)`,

          borderRadius: "50%",

          pointerEvents: "none",

          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",

          bottom: -80,
          right: -80,

          width: 350,
          height: 350,

          background:
            `radial-gradient(circle, ${SECONDARY}12 0%, transparent 70%)`,

          borderRadius: "50%",

          pointerEvents: "none",

          zIndex: 0,
        }}
      />

      {/* =====================================================
          MESSAGES AREA
          
          THIS IS THE ONLY SCROLLABLE AREA.
      ===================================================== */}

      <div
        style={{
          flex: "1 1 auto",

          minHeight: 0,

          overflowY: "auto",

          overflowX: "hidden",

          padding:
            "24px 0 28px",

          scrollbarWidth: "thin",

          scrollbarColor:
            `${SURFACE_CH} transparent`,

          position: "relative",

          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "100%",

            maxWidth: 960,

            margin: "0 auto",

            padding:
              "0 24px",

            boxSizing:
              "border-box",

            display: "flex",

            flexDirection:
              "column",

            gap: 20,
          }}
        >
          {/* =================================================
              MESSAGES
          ================================================= */}

          {messages.map(
            (msg) => (
              <motion.div
                key={msg.id}
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                style={{
                  display:
                    "flex",

                  gap: 12,

                  flexDirection:
                    msg.sender ===
                      "user"
                      ? "row-reverse"
                      : "row",

                  alignItems:
                    "flex-end",
                }}
              >
                {/* -----------------------------------------
                    AI ICON
                ----------------------------------------- */}

                {msg.sender ===
                  "bot" && (
                    <div
                      style={{
                        width: 36,
                        height: 36,

                        borderRadius: 12,

                        flexShrink: 0,

                        background:
                          `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,

                        display: "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        boxShadow:
                          `0 4px 12px ${PRIMARY}40`,
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: 18,

                          color: "#fff",

                          fontVariationSettings:
                            "'FILL' 1",
                        }}
                      >
                        auto_awesome
                      </span>
                    </div>
                  )}

                {/* -----------------------------------------
                    MESSAGE CONTENT
                ----------------------------------------- */}

                <div
                  style={{
                    display:
                      "flex",

                    flexDirection:
                      "column",

                    gap: 4,

                    maxWidth:
                      "75%",

                    alignItems:
                      msg.sender ===
                        "user"
                        ? "flex-end"
                        : "flex-start",

                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      padding:
                        "14px 20px",

                      borderRadius:
                        msg.sender ===
                          "user"
                          ? "22px 22px 4px 22px"
                          : "22px 22px 22px 4px",

                      background:
                        msg.sender ===
                          "user"
                          ? `linear-gradient(135deg, ${PRIMARY} 0%, #496246 100%)`
                          : SURFACE_C,

                      color:
                        msg.sender ===
                          "user"
                          ? "#fff"
                          : ON_SURFACE,

                      fontSize: 14,

                      lineHeight: 1.6,

                      border:
                        msg.sender ===
                          "bot"
                          ? `1px solid ${SURFACE_CH}`
                          : "none",

                      boxShadow:
                        "0 4px 16px rgba(0,0,0,.3)",

                      wordBreak:
                        "break-word",
                    }}
                  >
                    {renderText(
                      msg.text
                    )}

                    {/* -------------------------------------
                        PRODUCT BUTTON
                    ------------------------------------- */}

                    {msg.products &&
                      msg.products.length >
                      0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerProducts(
                              msg.products!
                            );

                            setDrawerOpen(
                              true
                            );
                          }}
                          style={{
                            display:
                              "inline-flex",

                            alignItems:
                              "center",

                            gap: 6,

                            marginTop:
                              12,

                            padding:
                              "8px 14px",

                            borderRadius:
                              999,

                            background:
                              `${PRIMARY}30`,

                            color:
                              PRIMARY,

                            border:
                              `1px solid ${PRIMARY}50`,

                            fontSize: 12,

                            fontWeight: 800,

                            cursor:
                              "pointer",

                            fontFamily:
                              "inherit",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: 16,
                            }}
                          >
                            shopping_basket
                          </span>

                          Open{" "}
                          {
                            msg
                              .products
                              .length
                          }{" "}
                          Recommended
                          Products →
                        </button>
                      )}
                  </div>

                  {/* ---------------------------------------
                      TIMESTAMP
                  --------------------------------------- */}

                  <span
                    style={{
                      fontSize: 10,

                      color:
                        ON_SURFACE_VAR,

                      padding:
                        "0 4px",
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString(
                      "en-IN",
                      {
                        hour: "2-digit",
                        minute:
                          "2-digit",
                      }
                    )}
                  </span>
                </div>
              </motion.div>
            )
          )}

          {/* =================================================
              QUICK SUGGESTIONS
          ================================================= */}

          <AnimatePresence>
            {showQuickPrompts && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -16,
                }}
                transition={{
                  delay: 0.1,
                }}
                style={{
                  marginTop: 8,
                }}
              >
                <p
                  style={{
                    textAlign:
                      "center",

                    fontSize: 11,

                    fontWeight: 800,

                    color: PRIMARY,

                    letterSpacing:
                      "0.12em",

                    textTransform:
                      "uppercase",

                    marginBottom:
                      14,
                  }}
                >
                  Quick Suggestions
                </p>

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(190px, 1fr))",

                    gap: 12,
                  }}
                >
                  {QUICK_PROMPTS.map(
                    (p) => (
                      <button
                        key={
                          p.query
                        }
                        type="button"
                        onClick={() =>
                          sendMessage(
                            p.query
                          )
                        }
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap: 12,

                          padding:
                            "14px 16px",

                          borderRadius:
                            18,

                          background:
                            SURFACE_C,

                          border:
                            `1px solid ${SURFACE_CH}`,

                          color:
                            ON_SURFACE,

                          cursor:
                            "pointer",

                          transition:
                            "all .2s",

                          fontFamily:
                            "inherit",

                          textAlign:
                            "left",
                        }}
                        onMouseEnter={(
                          e
                        ) => {
                          e.currentTarget.style.borderColor =
                            PRIMARY;

                          e.currentTarget.style.transform =
                            "translateY(-2px)";

                          e.currentTarget.style.background =
                            SURFACE_CH;
                        }}
                        onMouseLeave={(
                          e
                        ) => {
                          e.currentTarget.style.borderColor =
                            SURFACE_CH;

                          e.currentTarget.style.transform =
                            "none";

                          e.currentTarget.style.background =
                            SURFACE_C;
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,

                            borderRadius:
                              12,

                            background:
                              `${PRIMARY}20`,

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            flexShrink: 0,
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize:
                                20,

                              color:
                                PRIMARY,

                              fontVariationSettings:
                                "'FILL' 1",
                            }}
                          >
                            {
                              p.icon
                            }
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize:
                              13,

                            fontWeight:
                              700,

                            lineHeight:
                              1.3,
                          }}
                        >
                          {
                            p.label
                          }
                        </span>
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              TYPING INDICATOR
          ================================================= */}

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                style={{
                  display:
                    "flex",

                  gap: 12,

                  alignItems:
                    "flex-end",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,

                    borderRadius: 12,

                    background:
                      `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`,

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    flexShrink: 0,
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 18,

                      color: "#fff",

                      fontVariationSettings:
                        "'FILL' 1",
                    }}
                  >
                    auto_awesome
                  </span>
                </div>

                <div
                  style={{
                    padding:
                      "12px 18px",

                    borderRadius:
                      "20px 20px 20px 4px",

                    background:
                      SURFACE_C,

                    border:
                      `1px solid ${SURFACE_CH}`,

                    display:
                      "flex",

                    gap: 6,

                    alignItems:
                      "center",
                  }}
                >
                  {[0, 160, 320].map(
                    (delay) => (
                      <span
                        key={
                          delay
                        }
                        style={{
                          width: 8,
                          height: 8,

                          borderRadius:
                            "50%",

                          background:
                            PRIMARY,

                          opacity: 0.7,

                          animation:
                            "bounce 1s ease-in-out infinite",

                          animationDelay:
                            `${delay}ms`,
                        }}
                      />
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              SCROLL ANCHOR
          ================================================= */}

          <div
            ref={
              messagesEndRef
            }
          />
        </div>
      </div>

      {/* =====================================================
          VOICE LISTENING BANNER
      ===================================================== */}

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: 8,
            }}
            style={{
              flex:
                "0 0 auto",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: 12,

              padding:
                "10px 20px",

              background:
                "rgba(239,68,68,.15)",

              borderTop:
                "1px solid rgba(239,68,68,.3)",

              position:
                "relative",

              zIndex: 5,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,

                borderRadius:
                  "50%",

                background:
                  "#f87171",

                animation:
                  "ping 1s cubic-bezier(0,0,.2,1) infinite",
              }}
            />

            <span
              style={{
                fontSize: 13,

                fontWeight: 800,

                color:
                  "#f87171",
              }}
            >
              Listening to your
              voice...
            </span>

            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "flex-end",

                gap: 3,

                height: 20,
              }}
            >
              {[
                12,
                20,
                16,
                24,
                20,
                16,
                12,
              ].map(
                (h, i) => (
                  <span
                    key={i}
                    style={{
                      width: 3,

                      height: h,

                      background:
                        "#f87171",

                      borderRadius:
                        4,

                      animation:
                        "bounce 0.8s ease-in-out infinite",

                      animationDelay:
                        `${i * 80}ms`,

                      display:
                        "inline-block",
                    }}
                  />
                )
              )}
            </div>

            {input && (
              <span
                style={{
                  fontSize: 12,

                  color:
                    "rgba(248,113,113,.9)",

                  maxWidth: 220,

                  overflow:
                    "hidden",

                  textOverflow:
                    "ellipsis",

                  whiteSpace:
                    "nowrap",
                }}
              >
                {input}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          BOTTOM INPUT
          
          flex-shrink: 0 means this NEVER becomes part of
          the scrolling message area.
      ===================================================== */}

      <div
        style={{
          flex:
            "0 0 auto",

          width: "100%",

          boxSizing:
            "border-box",

          borderTop:
            `1px solid ${SURFACE_CH}`,

          background:
            "rgba(26,35,28,0.98)",

          backdropFilter:
            "blur(16px)",

          padding:
            "14px 24px 16px",

          position:
            "relative",

          zIndex: 10,
        }}
      >
        <div
          style={{
            width: "100%",

            maxWidth: 960,

            margin: "0 auto",
          }}
        >
          {/* =================================================
              INPUT ROW
          ================================================= */}

          <div
            style={{
              display:
                "flex",

              gap: 12,

              alignItems:
                "flex-end",
            }}
          >
            {/* ---------------------------------------------
                MICROPHONE
            --------------------------------------------- */}

            {isSupported && (
              <button
                type="button"
                onClick={
                  handleVoice
                }
                style={{
                  width: 50,
                  height: 50,

                  borderRadius:
                    16,

                  flexShrink: 0,

                  cursor:
                    "pointer",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  transition:
                    "all .2s",

                  background:
                    isListening
                      ? "#ef4444"
                      : SURFACE_CH,

                  color:
                    isListening
                      ? "#fff"
                      : ON_SURFACE,

                  border:
                    `1px solid ${isListening
                      ? "#ef4444"
                      : SURFACE_CHH
                    }`,

                  boxShadow:
                    isListening
                      ? "0 0 0 8px rgba(239,68,68,.2)"
                      : "none",

                  fontFamily:
                    "inherit",
                }}
                aria-label={
                  isListening
                    ? "Stop"
                    : "Voice input"
                }
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 24,
                  }}
                >
                  {isListening
                    ? "stop"
                    : "mic"}
                </span>
              </button>
            )}

            {/* ---------------------------------------------
                TEXTAREA
            --------------------------------------------- */}

            <textarea
              ref={
                textareaRef
              }
              value={input}
              onChange={(e) => {
                setInput(
                  e.target.value
                );

                e.target.style.height =
                  "auto";

                e.target.style.height =
                  Math.min(
                    e.target
                      .scrollHeight,
                    120
                  ) + "px";
              }}
              onKeyDown={(e) => {
                if (
                  e.key ===
                  "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();

                  sendMessage(
                    input
                  );
                }
              }}
              placeholder={
                isListening
                  ? "Listening... Speak product, cart, or payment command"
                  : "Ask me anything — 'give basmati rice', 'add to cart', 'proceed to payment'..."
              }
              rows={1}
              disabled={
                isListening
              }
              style={{
                flex: 1,

                minWidth: 0,

                minHeight: 50,

                maxHeight: 120,

                boxSizing:
                  "border-box",

                borderRadius:
                  16,

                padding:
                  "14px 18px",

                background:
                  SURFACE,

                border:
                  `1px solid ${SURFACE_CH}`,

                color:
                  ON_SURFACE,

                fontSize: 14,

                lineHeight: 1.5,

                outline: "none",

                resize: "none",

                overflowY:
                  "auto",

                fontFamily:
                  "'Outfit', sans-serif",

                transition:
                  "border-color .2s",

                opacity:
                  isListening
                    ? 0.6
                    : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor =
                  PRIMARY;
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  SURFACE_CH;
              }}
            />

            {/* ---------------------------------------------
                SEND
            --------------------------------------------- */}

            <button
              type="button"
              onClick={() =>
                sendMessage(
                  input
                )
              }
              disabled={
                !input.trim() ||
                isTyping ||
                isListening
              }
              style={{
                width: 50,
                height: 50,

                borderRadius:
                  16,

                flexShrink: 0,

                cursor:
                  "pointer",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                background:
                  `linear-gradient(135deg, ${PRIMARY}, #496246)`,

                color: "#fff",

                border: "none",

                transition:
                  "all .2s",

                fontFamily:
                  "inherit",

                opacity:
                  !input.trim() ||
                    isTyping ||
                    isListening
                    ? 0.4
                    : 1,

                boxShadow:
                  `0 4px 16px ${PRIMARY}50`,
              }}
              aria-label="Send"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,

                  fontVariationSettings:
                    "'FILL' 1",
                }}
              >
                send
              </span>
            </button>
          </div>

          {/* =================================================
              HINT
          ================================================= */}

          <p
            style={{
              textAlign:
                "center",

              fontSize: 11,

              color:
                `${ON_SURFACE_VAR}70`,

              margin:
                "8px 0 0",

              lineHeight:
                1.4,
            }}
          >
            Try typing:{" "}
            <strong
              style={{
                color: PRIMARY,
              }}
            >
              "give basmati
              rice"
            </strong>{" "}
            ·{" "}
            <strong
              style={{
                color: PRIMARY,
              }}
            >
              "add to cart"
            </strong>{" "}
            ·{" "}
            <strong
              style={{
                color: PRIMARY,
              }}
            >
              "proceed to
              payment"
            </strong>
          </p>
        </div>
      </div>

      {/* =====================================================
          PRODUCT RECOMMENDATION DRAWER
      ===================================================== */}

      <ProductRecommendationDrawer
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
        products={
          drawerProducts
        }
      />

      {/* =====================================================
          MICRO CART
      ===================================================== */}

      <MicroCartDrawer
        open={
          microCartOpen
        }
        onClose={() =>
          setMicroCartOpen(false)
        }
        onProceedToPayment={() =>
          setPaymentModalOpen(
            true
          )
        }
      />

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      <MicroPaymentModal
        open={
          paymentModalOpen
        }
        onClose={() =>
          setPaymentModalOpen(
            false
          )
        }
        onSuccess={() => {
          setPaymentModalOpen(
            false
          );

          setMessages(
            (prev) => [
              ...prev,

              {
                id:
                  Date.now(),

                text:
                  "🎉 **Order Placed Successfully!** " +
                  "Thank you for ordering with Bazaar AI. " +
                  "Your local store is processing the delivery right now!",

                sender: "bot",

                timestamp:
                  new Date(),
              },
            ]
          );
        }}
      />
    </div>
  );
}