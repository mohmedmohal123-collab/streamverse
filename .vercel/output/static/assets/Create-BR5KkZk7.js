import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, W as useId, $ as Primitive, a0 as composeEventHandlers, a6 as createContextScope, Y as useComposedRefs, T as useControllableState, y as useCallbackRef, am as Presence, t as cn, u as useTranslation, b as useActor, B as Button, v as ue, X } from "./index-B4P1PGaK.js";
import { B as Badge } from "./badge-B5FJUKjx.js";
import { I as Input } from "./input-DsF85mHK.js";
import { L as Label } from "./label-DLTocRv1.js";
import { S as Skeleton } from "./skeleton-BQhv6M21.js";
import { c as createCollection, V as Video, C as Circle } from "./index-C0QwvgEP.js";
import { u as useDirection, C as CircleCheck } from "./index-KgqyCsxg.js";
import { T as Textarea } from "./textarea-BcmhiIIK.js";
import { F as Film } from "./film-CmhOy8TL.js";
import { U as Upload } from "./upload-DDDpJKii.js";
import { C as Camera } from "./camera-2KGI6336.js";
import { L as LoaderCircle } from "./loader-circle-CD345DHk.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }]
];
const Square = createLucideIcon("square", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
];
const Tag = createLucideIcon("tag", __iconNode);
var ENTRY_FOCUS = "rovingFocusGroup.onEntryFocus";
var EVENT_OPTIONS = { bubbles: false, cancelable: true };
var GROUP_NAME = "RovingFocusGroup";
var [Collection, useCollection, createCollectionScope] = createCollection(GROUP_NAME);
var [createRovingFocusGroupContext, createRovingFocusGroupScope] = createContextScope(
  GROUP_NAME,
  [createCollectionScope]
);
var [RovingFocusProvider, useRovingFocusContext] = createRovingFocusGroupContext(GROUP_NAME);
var RovingFocusGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: props.__scopeRovingFocusGroup, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RovingFocusGroupImpl, { ...props, ref: forwardedRef }) }) });
  }
);
RovingFocusGroup.displayName = GROUP_NAME;
var RovingFocusGroupImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeRovingFocusGroup,
    orientation,
    loop = false,
    dir,
    currentTabStopId: currentTabStopIdProp,
    defaultCurrentTabStopId,
    onCurrentTabStopIdChange,
    onEntryFocus,
    preventScrollOnEntryFocus = false,
    ...groupProps
  } = props;
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const direction = useDirection(dir);
  const [currentTabStopId, setCurrentTabStopId] = useControllableState({
    prop: currentTabStopIdProp,
    defaultProp: defaultCurrentTabStopId ?? null,
    onChange: onCurrentTabStopIdChange,
    caller: GROUP_NAME
  });
  const [isTabbingBackOut, setIsTabbingBackOut] = reactExports.useState(false);
  const handleEntryFocus = useCallbackRef(onEntryFocus);
  const getItems = useCollection(__scopeRovingFocusGroup);
  const isClickFocusRef = reactExports.useRef(false);
  const [focusableItemsCount, setFocusableItemsCount] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const node = ref.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, handleEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, handleEntryFocus);
    }
  }, [handleEntryFocus]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RovingFocusProvider,
    {
      scope: __scopeRovingFocusGroup,
      orientation,
      dir: direction,
      loop,
      currentTabStopId,
      onItemFocus: reactExports.useCallback(
        (tabStopId) => setCurrentTabStopId(tabStopId),
        [setCurrentTabStopId]
      ),
      onItemShiftTab: reactExports.useCallback(() => setIsTabbingBackOut(true), []),
      onFocusableItemAdd: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount + 1),
        []
      ),
      onFocusableItemRemove: reactExports.useCallback(
        () => setFocusableItemsCount((prevCount) => prevCount - 1),
        []
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Primitive.div,
        {
          tabIndex: isTabbingBackOut || focusableItemsCount === 0 ? -1 : 0,
          "data-orientation": orientation,
          ...groupProps,
          ref: composedRefs,
          style: { outline: "none", ...props.style },
          onMouseDown: composeEventHandlers(props.onMouseDown, () => {
            isClickFocusRef.current = true;
          }),
          onFocus: composeEventHandlers(props.onFocus, (event) => {
            const isKeyboardFocus = !isClickFocusRef.current;
            if (event.target === event.currentTarget && isKeyboardFocus && !isTabbingBackOut) {
              const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
              event.currentTarget.dispatchEvent(entryFocusEvent);
              if (!entryFocusEvent.defaultPrevented) {
                const items = getItems().filter((item) => item.focusable);
                const activeItem = items.find((item) => item.active);
                const currentItem = items.find((item) => item.id === currentTabStopId);
                const candidateItems = [activeItem, currentItem, ...items].filter(
                  Boolean
                );
                const candidateNodes = candidateItems.map((item) => item.ref.current);
                focusFirst(candidateNodes, preventScrollOnEntryFocus);
              }
            }
            isClickFocusRef.current = false;
          }),
          onBlur: composeEventHandlers(props.onBlur, () => setIsTabbingBackOut(false))
        }
      )
    }
  );
});
var ITEM_NAME = "RovingFocusGroupItem";
var RovingFocusGroupItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRovingFocusGroup,
      focusable = true,
      active = false,
      tabStopId,
      children,
      ...itemProps
    } = props;
    const autoId = useId();
    const id = tabStopId || autoId;
    const context = useRovingFocusContext(ITEM_NAME, __scopeRovingFocusGroup);
    const isCurrentTabStop = context.currentTabStopId === id;
    const getItems = useCollection(__scopeRovingFocusGroup);
    const { onFocusableItemAdd, onFocusableItemRemove, currentTabStopId } = context;
    reactExports.useEffect(() => {
      if (focusable) {
        onFocusableItemAdd();
        return () => onFocusableItemRemove();
      }
    }, [focusable, onFocusableItemAdd, onFocusableItemRemove]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Collection.ItemSlot,
      {
        scope: __scopeRovingFocusGroup,
        id,
        focusable,
        active,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.span,
          {
            tabIndex: isCurrentTabStop ? 0 : -1,
            "data-orientation": context.orientation,
            ...itemProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!focusable) event.preventDefault();
              else context.onItemFocus(id);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => context.onItemFocus(id)),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if (event.key === "Tab" && event.shiftKey) {
                context.onItemShiftTab();
                return;
              }
              if (event.target !== event.currentTarget) return;
              const focusIntent = getFocusIntent(event, context.orientation, context.dir);
              if (focusIntent !== void 0) {
                if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
                event.preventDefault();
                const items = getItems().filter((item) => item.focusable);
                let candidateNodes = items.map((item) => item.ref.current);
                if (focusIntent === "last") candidateNodes.reverse();
                else if (focusIntent === "prev" || focusIntent === "next") {
                  if (focusIntent === "prev") candidateNodes.reverse();
                  const currentIndex = candidateNodes.indexOf(event.currentTarget);
                  candidateNodes = context.loop ? wrapArray(candidateNodes, currentIndex + 1) : candidateNodes.slice(currentIndex + 1);
                }
                setTimeout(() => focusFirst(candidateNodes));
              }
            }),
            children: typeof children === "function" ? children({ isCurrentTabStop, hasTabStop: currentTabStopId != null }) : children
          }
        )
      }
    );
  }
);
RovingFocusGroupItem.displayName = ITEM_NAME;
var MAP_KEY_TO_FOCUS_INTENT = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function getDirectionAwareKey(key, dir) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft" ? "ArrowRight" : key === "ArrowRight" ? "ArrowLeft" : key;
}
function getFocusIntent(event, orientation, dir) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key)) return void 0;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key)) return void 0;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}
function focusFirst(candidates, preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}
function wrapArray(array, startIndex) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}
var Root = RovingFocusGroup;
var Item = RovingFocusGroupItem;
var TABS_NAME = "Tabs";
var [createTabsContext] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = reactExports.useRef(isSelected);
    reactExports.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs$1;
var List = TabsList$1;
var Trigger = TabsTrigger$1;
var Content = TabsContent$1;
function Tabs({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root2,
    {
      "data-slot": "tabs",
      className: cn("flex flex-col gap-2", className),
      ...props
    }
  );
}
function TabsList({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    List,
    {
      "data-slot": "tabs-list",
      className: cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      ),
      ...props
    }
  );
}
function TabsTrigger({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trigger,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      ),
      ...props
    }
  );
}
function TabsContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Content,
    {
      "data-slot": "tabs-content",
      className: cn("flex-1 outline-none", className),
      ...props
    }
  );
}
const FILTERS = [
  {
    id: "normal",
    labelEn: "Normal",
    labelAr: "عادي",
    cssFilter: "none",
    preview: "🎬"
  },
  {
    id: "grayscale",
    labelEn: "Grayscale",
    labelAr: "أبيض وأسود",
    cssFilter: "grayscale(100%)",
    preview: "🖤"
  },
  {
    id: "sepia",
    labelEn: "Sepia",
    labelAr: "سيبيا",
    cssFilter: "sepia(80%)",
    preview: "🟤"
  },
  {
    id: "vintage",
    labelEn: "Vintage",
    labelAr: "كلاسيكي",
    cssFilter: "sepia(50%) contrast(1.2) saturate(0.8)",
    preview: "🎞️"
  },
  {
    id: "blur",
    labelEn: "Dream",
    labelAr: "حلمي",
    cssFilter: "blur(1.5px) brightness(1.1)",
    preview: "🌫️"
  },
  {
    id: "contrast",
    labelEn: "High Contrast",
    labelAr: "تباين عالٍ",
    cssFilter: "contrast(1.8) saturate(1.3)",
    preview: "⚡"
  },
  {
    id: "invert",
    labelEn: "Invert",
    labelAr: "معكوس",
    cssFilter: "invert(100%)",
    preview: "🔄"
  }
];
const CATEGORIES = [
  { value: "Entertainment", labelEn: "Entertainment", labelAr: "ترفيه" },
  { value: "Music", labelEn: "Music", labelAr: "موسيقى" },
  { value: "Education", labelEn: "Education", labelAr: "تعليم" },
  { value: "Gaming", labelEn: "Gaming", labelAr: "ألعاب" },
  { value: "Sports", labelEn: "Sports", labelAr: "رياضة" },
  { value: "Other", labelEn: "Other", labelAr: "أخرى" }
];
function FilterCarousel({
  activeFilter,
  onSelect,
  isRTL,
  language
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "filter-carousel scrollbar-hide",
      dir: isRTL ? "rtl" : "ltr",
      "data-ocid": "create.filter_carousel",
      children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          "data-ocid": `create.filter.${f.id}`,
          onClick: () => onSelect(f.id),
          className: cn(
            "filter-item flex flex-col items-center justify-center gap-1 px-2",
            activeFilter === f.id && "filter-item-active"
          ),
          "aria-label": language === "ar" ? f.labelAr : f.labelEn,
          "aria-pressed": activeFilter === f.id,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: f.preview }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-medium text-foreground leading-none text-center truncate w-full", children: language === "ar" ? f.labelAr : f.labelEn })
          ]
        },
        f.id
      ))
    }
  );
}
function TagInput({
  tags,
  onChange,
  placeholder
}) {
  const [input, setInput] = reactExports.useState("");
  const addTag = () => {
    const trimmed = input.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          "data-ocid": "create.tag_input",
          value: input,
          onChange: (e) => setInput(e.target.value),
          placeholder,
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          },
          className: "flex-1"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "secondary",
          size: "sm",
          onClick: addTag,
          "data-ocid": "create.add_tag_button",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "h-4 w-4" })
        }
      )
    ] }),
    tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Badge,
      {
        variant: "secondary",
        className: "gap-1 cursor-pointer hover:bg-destructive/20 transition-colors",
        onClick: () => onChange(tags.filter((t) => t !== tag)),
        "data-ocid": `create.tag.${tag}`,
        children: [
          "#",
          tag,
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" })
        ]
      },
      tag
    )) })
  ] });
}
function MetadataForm({
  form,
  onChange,
  isRTL,
  language,
  videoObjectUrl
}) {
  const labels = {
    title: language === "ar" ? "العنوان" : "Title",
    description: language === "ar" ? "الوصف" : "Description",
    thumbnail: language === "ar" ? "رابط الصورة المصغرة" : "Thumbnail URL",
    orCapture: language === "ar" ? "أو اترك فارغاً للتقاط تلقائي" : "Leave blank to auto-capture",
    tags: language === "ar" ? "الوسوم (اضغط Enter للإضافة)" : "Tags (press Enter to add)",
    category: language === "ar" ? "التصنيف" : "Category",
    titlePh: language === "ar" ? "أدخل عنوان الفيديو..." : "Enter video title...",
    descPh: language === "ar" ? "صف محتوى الفيديو..." : "Describe your video content...",
    thumbPh: language === "ar" ? "https://example.com/thumb.jpg" : "https://example.com/thumb.jpg",
    selectCat: language === "ar" ? "اختر التصنيف" : "Select category",
    preview: language === "ar" ? "معاينة" : "Preview",
    tagPh: language === "ar" ? "أضف وسماً..." : "Add a tag..."
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", dir: isRTL ? "rtl" : "ltr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "create-title", children: [
        labels.title,
        " *"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "create-title",
          "data-ocid": "create.title_input",
          value: form.title,
          onChange: (e) => onChange({ title: e.target.value }),
          placeholder: labels.titlePh,
          maxLength: 100
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "create-desc", children: labels.description }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          id: "create-desc",
          "data-ocid": "create.description_textarea",
          value: form.description,
          onChange: (e) => onChange({ description: e.target.value }),
          placeholder: labels.descPh,
          rows: 3
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "create-thumb", children: [
        labels.thumbnail,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs ms-1", children: [
          "(",
          labels.orCapture,
          ")"
        ] })
      ] }),
      videoObjectUrl && !form.thumbnailUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            src: videoObjectUrl,
            className: "w-full max-h-24 object-cover rounded-md bg-muted",
            muted: true,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("track", { kind: "captions" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 end-2 text-[10px] text-muted-foreground bg-card/80 px-1.5 py-0.5 rounded", children: labels.preview })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "create-thumb",
          "data-ocid": "create.thumbnail_input",
          value: form.thumbnailUrl,
          onChange: (e) => onChange({ thumbnailUrl: e.target.value }),
          placeholder: labels.thumbPh
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: labels.tags }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TagInput,
        {
          tags: form.tags,
          onChange: (tags) => onChange({ tags }),
          placeholder: labels.tagPh
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { htmlFor: "create-category", children: [
        labels.category,
        " *"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          id: "create-category",
          "data-ocid": "create.category_select",
          value: form.category,
          onChange: (e) => onChange({ category: e.target.value }),
          className: "w-full px-3 py-2 rounded-md bg-input text-foreground border border-border focus:border-primary focus:ring-2 focus:ring-ring/30 transition-colors text-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: labels.selectCat }),
            CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.value, children: language === "ar" ? c.labelAr : c.labelEn }, c.value))
          ]
        }
      )
    ] })
  ] });
}
function UploadTab({
  isRTL,
  language,
  onVideoReady
}) {
  const [isDragging, setIsDragging] = reactExports.useState(false);
  const [videoUrl, setVideoUrl] = reactExports.useState(null);
  const [fileName, setFileName] = reactExports.useState("");
  const fileRef = reactExports.useRef(null);
  const errorMsg = language === "ar" ? "الملف المحدد ليس فيديو" : "Selected file is not a video";
  const handleFile = reactExports.useCallback(
    (file) => {
      if (!file.type.startsWith("video/")) {
        ue.error(errorMsg);
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setFileName(file.name);
      onVideoReady(url);
    },
    [errorMsg, onVideoReady]
  );
  const onDrop = reactExports.useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );
  const onFileChange = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (file) handleFile(file);
  };
  const labels = {
    dropzone: language === "ar" ? "اسحب وأفلت ملف الفيديو هنا" : "Drag & drop your video here",
    or: language === "ar" ? "أو" : "or",
    browse: language === "ar" ? "تصفح الملفات" : "Browse Files",
    supported: language === "ar" ? "MP4 · WebM · MOV · حتى 500 MB" : "MP4 · WebM · MOV · up to 500 MB",
    selected: language === "ar" ? "تم اختيار الفيديو" : "Video selected",
    change: language === "ar" ? "تغيير الفيديو" : "Change video"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", dir: isRTL ? "rtl" : "ltr", children: [
    !videoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        "data-ocid": "create.upload_dropzone",
        className: cn(
          "w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer",
          isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/60 hover:bg-muted/30"
        ),
        onDragOver: (e) => {
          e.preventDefault();
          setIsDragging(true);
        },
        onDragLeave: () => setIsDragging(false),
        onDrop,
        onClick: () => {
          var _a;
          return (_a = fileRef.current) == null ? void 0 : _a.click();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full gradient-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-8 w-8 text-primary-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: labels.dropzone }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: labels.or }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "secondary",
                size: "sm",
                className: "mt-2",
                tabIndex: -1,
                type: "button",
                children: labels.browse
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: labels.supported })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-xl overflow-hidden bg-muted aspect-video", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            src: videoUrl,
            className: "w-full h-full object-contain",
            controls: true,
            "data-ocid": "create.upload_preview",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("track", { kind: "captions" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-2 end-2 flex items-center gap-1.5 bg-card/90 rounded-md px-2 py-1 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 text-green-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: labels.selected })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground truncate max-w-[70%]", children: fileName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            type: "button",
            "data-ocid": "create.upload_change_button",
            onClick: () => {
              setVideoUrl(null);
              setFileName("");
            },
            children: labels.change
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref: fileRef,
        type: "file",
        accept: "video/mp4,video/webm,video/quicktime",
        className: "hidden",
        onChange: onFileChange,
        "data-ocid": "create.upload_file_input"
      }
    )
  ] });
}
function CameraTab({
  isRTL,
  language,
  onVideoReady
}) {
  var _a;
  const videoRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const recorderRef = reactExports.useRef(null);
  const chunksRef = reactExports.useRef([]);
  const [activeFilter, setActiveFilter] = reactExports.useState("normal");
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [cameraReady, setCameraReady] = reactExports.useState(false);
  const [cameraError, setCameraError] = reactExports.useState(null);
  const [recordedUrl, setRecordedUrl] = reactExports.useState(null);
  const [recordSeconds, setRecordSeconds] = reactExports.useState(0);
  const timerRef = reactExports.useRef(null);
  const labels = {
    startCamera: language === "ar" ? "تشغيل الكاميرا" : "Start Camera",
    stopCamera: language === "ar" ? "إيقاف الكاميرا" : "Stop Camera",
    startRecord: language === "ar" ? "بدء التسجيل" : "Start Recording",
    stopRecord: language === "ar" ? "إيقاف التسجيل" : "Stop Recording",
    recording: language === "ar" ? "جارٍ التسجيل" : "Recording",
    filters: language === "ar" ? "الفلاتر" : "Filters",
    cameraErr: language === "ar" ? "تعذّر الوصول إلى الكاميرا. تأكد من منح الإذن." : "Could not access camera. Please allow camera permission.",
    retake: language === "ar" ? "إعادة التسجيل" : "Retake"
  };
  const activeFilterCSS = ((_a = FILTERS.find((f) => f.id === activeFilter)) == null ? void 0 : _a.cssFilter) ?? "none";
  const stopCamera = reactExports.useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraError(labels.cameraErr);
    }
  };
  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9,opus"
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      onVideoReady(url);
    };
    recorder.start(250);
    recorderRef.current = recorder;
    setIsRecording(true);
    setRecordSeconds(0);
    timerRef.current = setInterval(() => setRecordSeconds((s) => s + 1), 1e3);
  };
  const stopRecording = () => {
    var _a2;
    (_a2 = recorderRef.current) == null ? void 0 : _a2.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };
  reactExports.useEffect(
    () => () => {
      stopCamera();
    },
    [stopCamera]
  );
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", dir: isRTL ? "rtl" : "ltr", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "filter-preview relative", children: [
      !cameraReady && !recordedUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/60 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-12 w-12 text-muted-foreground" }),
        cameraError ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-sm text-destructive text-center px-4",
            "data-ocid": "create.camera_error_state",
            children: cameraError
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            "data-ocid": "create.start_camera_button",
            onClick: startCamera,
            className: "gradient-primary text-primary-foreground",
            type: "button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4 me-2" }),
              labels.startCamera
            ]
          }
        )
      ] }),
      recordedUrl && !cameraReady && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          src: recordedUrl,
          className: "w-full h-full object-contain rounded-lg",
          controls: true,
          "data-ocid": "create.recorded_preview",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("track", { kind: "captions" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          ref: videoRef,
          className: cn(
            "w-full h-full object-cover rounded-lg",
            !cameraReady && "hidden"
          ),
          style: { filter: activeFilterCSS, transform: "scaleX(-1)" },
          muted: true,
          playsInline: true,
          "data-ocid": "create.camera_live",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("track", { kind: "captions" })
        }
      ),
      isRecording && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 start-3 flex items-center gap-2 bg-card/90 rounded-full px-3 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "record-indicator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-mono text-foreground", children: formatTime(recordSeconds) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: labels.recording })
      ] })
    ] }),
    cameraReady && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "camera-controls", "data-ocid": "create.camera_controls", children: [
      !isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "record-button",
          "data-ocid": "create.record_button",
          onClick: startRecording,
          "aria-label": labels.startRecord,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-6 w-6 fill-primary-foreground" })
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: "record-button animate-pulse",
          "data-ocid": "create.stop_record_button",
          onClick: stopRecording,
          "aria-label": labels.stopRecord,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "h-5 w-5 fill-primary-foreground" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: stopCamera,
          type: "button",
          "data-ocid": "create.stop_camera_button",
          children: labels.stopCamera
        }
      )
    ] }),
    recordedUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        size: "sm",
        type: "button",
        "data-ocid": "create.retake_button",
        onClick: () => {
          setRecordedUrl(null);
          startCamera();
        },
        children: labels.retake
      }
    ),
    cameraReady && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: labels.filters }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FilterCarousel,
        {
          activeFilter,
          onSelect: setActiveFilter,
          isRTL,
          language
        }
      )
    ] })
  ] });
}
function Create() {
  const { language, isRTL } = useTranslation();
  const { actor, isFetching } = useActor();
  const [videoObjectUrl, setVideoObjectUrl] = reactExports.useState("");
  const [form, setForm] = reactExports.useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    tags: [],
    category: ""
  });
  const [isPublishing, setIsPublishing] = reactExports.useState(false);
  const [publishDone, setPublishDone] = reactExports.useState(false);
  const labels = {
    pageTitle: language === "ar" ? "إنشاء فيديو" : "Create Video",
    tabUpload: language === "ar" ? "رفع فيديو" : "Upload",
    tabCamera: language === "ar" ? "الكاميرا" : "Camera",
    metaSection: language === "ar" ? "تفاصيل الفيديو" : "Video Details",
    publish: language === "ar" ? "نشر الفيديو" : "Publish Video",
    publishing: language === "ar" ? "جارٍ النشر..." : "Publishing...",
    published: language === "ar" ? "تم النشر بنجاح! 🎉" : "Published successfully! 🎉",
    subtitle: language === "ar" ? "ارفع أو سجّل فيديو وشاركه مع العالم" : "Upload or record a video and share it with the world",
    needVideo: language === "ar" ? "اختر فيديو أولاً" : "Please select a video first",
    needTitle: language === "ar" ? "العنوان مطلوب" : "Title is required",
    needCat: language === "ar" ? "التصنيف مطلوب" : "Category is required",
    publishErr: language === "ar" ? "فشل النشر. حاول مرة أخرى." : "Publish failed. Please try again.",
    noActor: language === "ar" ? "الاتصال بالخادم غير متاح. تأكد من تسجيل الدخول." : "Backend unavailable. Make sure you're signed in."
  };
  const handleVideoReady = (url) => {
    setVideoObjectUrl(url);
    setPublishDone(false);
  };
  const handlePublish = async () => {
    if (!videoObjectUrl) {
      ue.error(labels.needVideo);
      return;
    }
    if (!form.title.trim()) {
      ue.error(labels.needTitle);
      return;
    }
    if (!form.category) {
      ue.error(labels.needCat);
      return;
    }
    if (!actor || isFetching) {
      ue.error(labels.noActor);
      return;
    }
    setIsPublishing(true);
    try {
      await actor.createVideoPost({
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: videoObjectUrl,
        thumbnailUrl: form.thumbnailUrl.trim(),
        tags: form.tags,
        category: form.category
      });
      setPublishDone(true);
      ue.success(labels.published);
      setForm({
        title: "",
        description: "",
        thumbnailUrl: "",
        tags: [],
        category: ""
      });
      setVideoObjectUrl("");
    } catch (err) {
      console.error(err);
      ue.error(labels.publishErr);
    } finally {
      setIsPublishing(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "min-h-full bg-background pb-20 md:pb-8",
      dir: isRTL ? "rtl" : "ltr",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "max-w-2xl mx-auto px-4 py-6 space-y-6",
          dir: isRTL ? "rtl" : "ltr",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "h-5 w-5 text-primary-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-xl text-foreground", children: labels.pageTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: labels.subtitle })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "upload", className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full", "data-ocid": "create.source_tabs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  TabsTrigger,
                  {
                    value: "upload",
                    className: "flex-1 gap-2",
                    "data-ocid": "create.upload_tab",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
                      labels.tabUpload
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  TabsTrigger,
                  {
                    value: "camera",
                    className: "flex-1 gap-2",
                    "data-ocid": "create.camera_tab",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }),
                      labels.tabCamera
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "upload", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                UploadTab,
                {
                  isRTL,
                  language,
                  onVideoReady: handleVideoReady
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "camera", className: "mt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                CameraTab,
                {
                  isRTL,
                  language,
                  onVideoReady: handleVideoReady
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-5 space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-semibold text-foreground flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "h-4 w-4 text-primary" }),
                labels.metaSection
              ] }),
              isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", "data-ocid": "create.form_loading_state", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 w-full" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                MetadataForm,
                {
                  form,
                  onChange: (patch) => setForm((f) => ({ ...f, ...patch })),
                  isRTL,
                  language,
                  videoObjectUrl
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pb-6", children: publishDone ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400",
                "data-ocid": "create.publish_success_state",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: labels.published })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                className: "w-full gradient-primary text-primary-foreground font-bold py-6 text-base rounded-xl hover:opacity-90 transition-opacity",
                onClick: handlePublish,
                disabled: isPublishing || isFetching,
                "data-ocid": "create.publish_button",
                type: "button",
                children: isPublishing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 me-2 animate-spin" }),
                  labels.publishing
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5 me-2" }),
                  labels.publish
                ] })
              }
            ) })
          ]
        }
      )
    }
  );
}
export {
  Create as default
};
