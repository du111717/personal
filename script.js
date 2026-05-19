// 导航菜单：移动端点击按钮展开/收起菜单
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

navToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// 滚动状态：给顶部导航添加阴影，并根据当前区块高亮菜单
const sections = [...document.querySelectorAll("main section[id]")];

function updateHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 18);

  const current = sections.findLast((section) => {
    const top = section.getBoundingClientRect().top;
    return top <= 140;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", current && link.getAttribute("href") === `#${current.id}`);
  });
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

// 首屏英文小标题：自动拆成逐字母动画，后续改文案不需要手动包 span
const heroEyebrow = document.querySelector(".hero-eyebrow");

if (heroEyebrow) {
  const text = heroEyebrow.textContent.trim();
  heroEyebrow.textContent = "";

  [...text].forEach((char, index) => {
    const letter = document.createElement("span");
    letter.className = "letter";
    letter.style.animationDelay = `${Math.min(index * 0.018, 0.42)}s`;
    letter.innerHTML = char === " " ? "&nbsp;" : char;
    heroEyebrow.appendChild(letter);
  });
}

// 首屏背景光斑：鼠标移动时只让柔光轻微跟随，背景图保持稳定
const heroSection = document.querySelector(".hero");

if (heroSection && !prefersReducedMotion) {
  let pointerFrame = 0;

  heroSection.addEventListener("pointermove", (event) => {
    if (pointerFrame) return;

    pointerFrame = requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 24;

      heroSection.style.setProperty("--glow-x", `${x.toFixed(1)}px`);
      heroSection.style.setProperty("--glow-y", `${y.toFixed(1)}px`);
      pointerFrame = 0;
    });
  });

  heroSection.addEventListener("pointerleave", () => {
    heroSection.style.setProperty("--glow-x", "0px");
    heroSection.style.setProperty("--glow-y", "0px");
  });
}

// 首页主标题：入场完成后给两行标题加极轻微分层浮动
const heroTitleLines = document.querySelectorAll(".hero-title span");

if (heroTitleLines.length && !prefersReducedMotion) {
  window.setTimeout(() => {
    heroTitleLines.forEach((line) => line.classList.add("is-floating"));
  }, 1400);
}

// 首屏数据卡片：进入视口后数字从 0 增长到目标值
function animateMetric(metric) {
  const target = Number(metric.dataset.count || 0);
  const suffix = metric.dataset.suffix || "";

  if (prefersReducedMotion || !Number.isFinite(target)) {
    metric.textContent = `${target}${suffix}`;
    return;
  }

  const duration = 1100;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    metric.textContent = `${Math.round(target * eased)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

const metricItems = document.querySelectorAll(".metric[data-count]");
const metricObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateMetric(entry.target);
        metricObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.55 }
);

metricItems.forEach((metric) => {
  if (!prefersReducedMotion) {
    metric.textContent = metric.dataset.suffix || "";
  }

  metricObserver.observe(metric);
});

// 入场动效：元素进入视口时添加 is-visible，CSS 负责动画表现
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

// 成长记录时间线：列表进入视口时绘制竖线，形成阶段逐步点亮的感觉
const timelineTrack = document.querySelector(".timeline-track");

if (timelineTrack) {
  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.22 }
  );

  timelineObserver.observe(timelineTrack);
}

// 学习进度条：读取每张卡片的 data-progress，进入页面后自动展开
const progressObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const value = card.dataset.progress || "0";
        card.style.setProperty("--progress", `${value}%`);
        card.classList.add("is-progress-visible");
        progressObserver.unobserve(card);
      }
    });
  },
  { threshold: 0.35 }
);

const skillCards = document.querySelectorAll(".skill-card");

skillCards.forEach((card) => {
  progressObserver.observe(card);

  if (!prefersReducedMotion) {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.setProperty("--tilt-y", `${(x * 3.2).toFixed(2)}deg`);
      card.style.setProperty("--tilt-x", `${(-y * 3.2).toFixed(2)}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    });
  }
});

// 笔记筛选：修改 HTML 中 data-category 的值，就能扩展更多分类
const filterButtons = document.querySelectorAll(".filter-btn");
const noteCards = document.querySelectorAll(".note-card");
const noteToggles = document.querySelectorAll(".note-toggle");

// 学习笔记详情：点击“阅读全文”在当前卡片内展开详细内容
noteToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const card = toggle.closest(".note-card");
    const detail = card.querySelector(".note-detail");
    const isExpanded = card.classList.toggle("is-expanded");

    detail.hidden = false;
    toggle.setAttribute("aria-expanded", String(isExpanded));
    toggle.textContent = isExpanded ? "收起内容" : "阅读全文";

    if (!isExpanded) {
      window.setTimeout(() => {
        detail.hidden = true;
      }, prefersReducedMotion ? 0 : 340);
    }
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    const visibleCards = [...noteCards].filter((card) => !card.classList.contains("is-hidden"));

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    if (prefersReducedMotion) {
      noteCards.forEach((card) => {
        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !shouldShow);
      });
      return;
    }

    noteCards.forEach((card) => {
      card.classList.remove("is-filtering-out", "is-filtering-in");
      card.style.animationDelay = "";
    });

    visibleCards.forEach((card) => card.classList.add("is-filtering-out"));

    window.setTimeout(() => {
      noteCards.forEach((card, index) => {
        card.classList.remove("is-filtering-out");
        card.style.animationDelay = "";

        const shouldShow = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !shouldShow);

        if (shouldShow) {
          card.classList.add("is-filtering-in");
          card.style.animationDelay = `${Math.min(index * 80, 480)}ms`;
        }
      });
    }, 150);

    window.setTimeout(() => {
      noteCards.forEach((card) => {
        card.classList.remove("is-filtering-in");
        card.style.animationDelay = "";
      });
    }, 560);
  });
});
