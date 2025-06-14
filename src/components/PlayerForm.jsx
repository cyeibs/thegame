import React, { useState, useRef, useEffect } from "react";
import styles from "./PlayerForm.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSkull,
  faDiceD20,
  faFlask,
  faComments,
  faClipboardList,
  faLightbulb,
  faQuestionCircle,
  faBrain,
  faSmile,
  faHeart,
  faPuzzlePiece,
  faGavel,
  faUsers,
  faGlassCheers,
  faFeatherAlt,
  faBook,
  faCogs,
  faFistRaised,
  faUserSecret,
  faChartLine,
  faHandshake,
  faGhost,
  faPenFancy,
  faBan,
  faGripVertical,
} from "@fortawesome/free-solid-svg-icons";
import { Reorder, useMotionValue, animate } from "framer-motion";
import { motion } from "framer-motion";
import html2pdf from "html2pdf.js";
import { supabase } from "../supabase";

const initialLikes = [
  { key: "setting", icon: faFeatherAlt, label: "Мир и сеттинг" },
  { key: "mechanics", icon: faCogs, label: "Интересные механики" },
  { key: "combat", icon: faFistRaised, label: "Боевые сцены" },
  { key: "mystery", icon: faUserSecret, label: "Загадки и тайны" },
  { key: "progress", icon: faChartLine, label: "Развитие персонажа" },
  { key: "relations", icon: faHandshake, label: "Отношения" },
  { key: "glass", icon: faGlassCheers, label: '"Стекло"' },
  { key: "desc", icon: faPenFancy, label: "Красивые описания" },
];

function useRaisedShadow(value) {
  const boxShadow = useMotionValue("0px 0px 0px rgba(0,0,0,0.8)");
  React.useEffect(() => {
    let isActive = false;
    value.onChange((latest) => {
      const wasActive = isActive;
      if (latest !== 0) {
        isActive = true;
        if (isActive !== wasActive) {
          animate(boxShadow, "5px 5px 10px rgba(0,0,0,0.3)");
        }
      } else {
        isActive = false;
        if (isActive !== wasActive) {
          animate(boxShadow, "0px 0px 0px rgba(0,0,0,0.8)");
        }
      }
    });
  }, [value, boxShadow]);
  return boxShadow;
}

function ReorderLikeItem({ item }) {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  return (
    <Reorder.Item
      value={item}
      id={item.key}
      style={{ boxShadow, y }}
      className={styles.playerLikeItem}
    >
      <div className={styles.statLabel}>
        <div className={styles.iconBox}>
          <FontAwesomeIcon icon={item.icon} />
        </div>
        {item.label}
      </div>
      <FontAwesomeIcon
        icon={faGripVertical}
        style={{ cursor: "grab", color: "#ADADAD", marginLeft: 12 }}
      />
    </Reorder.Item>
  );
}

const sliderDefs = [
  { key: "plan", left: "План", right: "Импровизация" },
  { key: "jokes", left: "Шутки за триста", right: "Серьезность" },
  { key: "team", left: "Объединиться", right: "Действовать в соло" },
  { key: "rules", left: "Разобраться в правилах", right: '"Что кидать?"' },
  { key: "dark", left: "Мрачность", right: "Милота" },
];

const PlayerForm = () => {
  const [likes, setLikes] = useState(initialLikes);
  const [sliders, setSliders] = useState({
    plan: 50,
    jokes: 50,
    team: 50,
    rules: 50,
    dark: 50,
  });
  const [isTooNarrow, setIsTooNarrow] = useState(false);
  const formRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    nri_experience: "",
    try_mechanics: "",
    ready_to_die: "",
    forbidden_topics: "",
    stat_knowledge: 0,
    stat_charisma: 0,
    stat_discipline: 0,
    stat_creativity: 0,
    stat_curiosity: 0,
    stat_strangeness: 0,
    stat_empathy: 0,
    stat_humor: 0,
  });

  // useEffect(() => {
  //   function handleResize() {
  //     setIsTooNarrow(window.innerWidth < 620);
  //   }
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // if (isTooNarrow) {
  //   return (
  //     <div
  //       style={{
  //         maxWidth: 400,
  //         margin: "40px auto",
  //         padding: "32px 16px",
  //         background: "#fff",
  //         borderRadius: 16,
  //         boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
  //         textAlign: "center",
  //         fontFamily: "Inter, Segoe UI, sans-serif",
  //         color: "#000",
  //         fontSize: 18,
  //         lineHeight: 1.5,
  //       }}
  //     >
  //       Пожалуйста, перейдите на десктоп или переверните экран телефона для
  //       корректного заполнения и сохранения PDF.
  //     </div>
  //   );
  // }

  const handleSavePdf = (e) => {
    e.preventDefault();
    const form = formRef.current;
    form.setAttribute("data-print-mode", "true");
    setTimeout(() => {
      html2pdf()
        .set({
          margin: 0,
          filename: "player-form.pdf",
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all"] },
        })
        .from(form)
        .save()
        .then(() => {
          form.removeAttribute("data-print-mode");
        });
    }, 100);
  };

  const handleSaveToSupabase = async () => {
    const data = {
      ...formData,
      likes_order: JSON.stringify(likes.map((l) => l.label)),
      slider_plan: sliders.plan,
      slider_jokes: sliders.jokes,
      slider_team: sliders.team,
      slider_rules: sliders.rules,
      slider_dark: sliders.dark,
    };
    const { error } = await supabase.from("dnd").insert([data]);
    if (error) {
      alert("Ошибка при сохранении: " + error.message);
    } else {
      alert("Сохранено!");
    }
  };

  return (
    <form
      ref={formRef}
      id="player-form-root"
      className={styles.form}
      style={{ color: "#000", fontFamily: "Inter, Segoe UI, sans-serif" }}
    >
      <h1 className={styles.title}>
        <FontAwesomeIcon icon={faDiceD20} /> Анкета игрока
      </h1>
      <div className={styles.topFields}>
        <div className={styles.leftFields}>
          <div className={styles.inputGroup}>
            <FontAwesomeIcon icon={faUser} />
            <input
              className={styles.input}
              placeholder="Твое имя:"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
            />
          </div>
          <div className={styles.inputGroup}>
            <FontAwesomeIcon icon={faDiceD20} />
            <input
              className={styles.input}
              placeholder="Сколько раз играл в НРИ:"
              value={formData.nri_experience}
              onChange={(e) =>
                setFormData((f) => ({ ...f, nri_experience: e.target.value }))
              }
            />
          </div>
          <div className={styles.inputGroup + " " + styles.textareaGroup}>
            <FontAwesomeIcon icon={faFlask} />
            <textarea
              className={styles.input}
              placeholder="Хочу попробовать (механики/системы):"
              value={formData.try_mechanics}
              onChange={(e) =>
                setFormData((f) => ({ ...f, try_mechanics: e.target.value }))
              }
            />
          </div>
        </div>
        <div className={styles.rightFields}>
          <div className={styles.inputGroup}>
            <FontAwesomeIcon icon={faSkull} />
            <input
              className={styles.input}
              placeholder="Готов к смерти  персонажа (да/нет):"
              value={formData.ready_to_die}
              onChange={(e) =>
                setFormData((f) => ({ ...f, ready_to_die: e.target.value }))
              }
            />
          </div>
          <div className={styles.inputGroup + " " + styles.textareaGroup}>
            <FontAwesomeIcon icon={faBan} />
            <textarea
              className={styles.input + " " + styles.textarea}
              placeholder="Запретные темы:"
              rows={4}
              value={formData.forbidden_topics}
              onChange={(e) =>
                setFormData((f) => ({ ...f, forbidden_topics: e.target.value }))
              }
            />
          </div>
        </div>
      </div>
      <div className={styles.sections}>
        <div className={styles.playerStatsSection}>
          <h2>
            <FontAwesomeIcon icon={faClipboardList} /> Характеристики игрока
          </h2>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faBook} />
              </div>
              Знания:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_knowledge}
              onChange={(e) =>
                setFormData((f) => ({ ...f, stat_knowledge: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faComments} />
              </div>
              Харизма:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_charisma}
              onChange={(e) =>
                setFormData((f) => ({ ...f, stat_charisma: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faGavel} />
              </div>
              Дисциплина:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_discipline}
              onChange={(e) =>
                setFormData((f) => ({ ...f, stat_discipline: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faLightbulb} />
              </div>
              Креативность:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_creativity}
              onChange={(e) =>
                setFormData((f) => ({ ...f, stat_creativity: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              Любопытство:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_curiosity}
              onChange={(e) =>
                setFormData((f) => ({ ...f, stat_curiosity: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faBrain} />
              </div>
              Странность:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_strangeness}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  stat_strangeness: +e.target.value,
                }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faHeart} />
              </div>
              Эмпатия:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_empathy}
              onChange={(e) =>
                setFormData((f) => ({ ...f, stat_empathy: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.playerStatItem}>
            <div className={styles.statLabel}>
              <div className={styles.iconBox}>
                <FontAwesomeIcon icon={faSmile} />
              </div>
              Юмор:
            </div>
            <select
              className={styles.statSelect}
              value={formData.stat_humor}
              onChange={(e) =>
                setFormData((f) => ({ ...f, stat_humor: +e.target.value }))
              }
            >
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.playerLikesSection}>
          <h2>
            <FontAwesomeIcon icon={faPuzzlePiece} /> Что ты{" "}
            <FontAwesomeIcon icon={faHeart} /> в играх?
          </h2>
          <Reorder.Group
            axis="y"
            onReorder={setLikes}
            values={likes}
            className={styles.likesReorderGroup}
          >
            {likes.map((item) => (
              <ReorderLikeItem key={item.key} item={item} />
            ))}
          </Reorder.Group>
        </div>
      </div>
      <div className={styles.slidersSection}>
        <h2 style={{ textAlign: "left" }}>
          <FontAwesomeIcon icon={faClipboardList} /> Какой тип игры тебе
          нравится?
        </h2>
        <div className={styles.slidersGrid}>
          {sliderDefs.map(({ key, left, right }) => (
            <div className={styles.sliderGroup} key={key}>
              <div className={styles.sliderLabelRow}>
                <span>{left}</span>
                <span>{right}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <motion.input
                  type="range"
                  min={0}
                  max={100}
                  value={sliders[key]}
                  className={styles.slider}
                  onChange={(e) =>
                    setSliders((s) => ({ ...s, [key]: +e.target.value }))
                  }
                  transition={{ type: "spring", stiffness: 300 }}
                />
                <span
                  style={{
                    minWidth: 28,
                    textAlign: "right",
                    fontSize: 12,
                    color: "#6385DB",
                    fontWeight: 600,
                  }}
                >
                  {sliders[key]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <button
        type="button"
        className={styles.saveBtn}
        data-print-hide
        onClick={handleSavePdf}
      >
        Сохранить в PDF
      </button> */}
      <button
        type="button"
        className={styles.saveBtn}
        onClick={handleSaveToSupabase}
      >
        Сохранить
      </button>
    </form>
  );
};

export default PlayerForm;
