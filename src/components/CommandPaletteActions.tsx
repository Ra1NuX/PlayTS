import { Action, useKBar, useRegisterActions } from "kbar";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { BiSolidMoon, BiPackage } from "react-icons/bi";
import { BsType, BsGlobe2, BsArrowUp, BsArrowDown, BsTrash } from "react-icons/bs";
import { useTheme } from "../hooks/useTheme";
import { useFont } from "../hooks/useFonts";
import useDependencies from "../hooks/useDependencies";
import { EDITOR_FONTS } from "../constants/editorFonts";
import { LOCALES } from "../constants/locales";
import {
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  FONT_SIZE_STEP,
} from "../constants/editorFontSizes";
import type { NpmSearchResponse } from "../model/npm";
import { fetchNpmSearch } from "../utils/npmSearch";

const CHANGE_FONT_PARENT_ID = "change-font";
const CHANGE_LANGUAGE_PARENT_ID = "change-language";
const INSTALL_NPM_PARENT_ID = "install-npm";
const UNINSTALL_NPM_PARENT_ID = "uninstall-npm";
const NPM_SEARCH_DEBOUNCE_MS = 300;

const RegisterCommandPaletteActions = () => {
  const { t, i18n } = useTranslation();
  const { toggleTheme } = useTheme();
  const { changeFont, changeSize, size } = useFont();
  const { download, packages } = useDependencies();
  const currentSize = Number(size);
  const { searchQuery, currentRootActionId, query } = useKBar((state) => ({
    searchQuery: state.searchQuery,
    currentRootActionId: state.currentRootActionId,
  }));
  const [npmResults, setNpmResults] = useState<NpmSearchResponse | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevRootIdRef = useRef<string | null | undefined>(undefined);
  const fetchIdRef = useRef(0);
  const justEnteredInstallNpmRef = useRef(false);

  useEffect(() => {
    if (currentRootActionId === INSTALL_NPM_PARENT_ID && prevRootIdRef.current !== INSTALL_NPM_PARENT_ID) {
      query.setSearch("");
      setNpmResults(null);
      justEnteredInstallNpmRef.current = true;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      fetchIdRef.current += 1;
    }
    prevRootIdRef.current = currentRootActionId;
  }, [currentRootActionId, query]);

  useEffect(() => {
    if (currentRootActionId !== INSTALL_NPM_PARENT_ID) {
      setNpmResults(null);
      return;
    }
    if (justEnteredInstallNpmRef.current) {
      justEnteredInstallNpmRef.current = false;
      return;
    }
    const trimmed = searchQuery.trim();
    if (trimmed.length <= 1) {
      setNpmResults(null);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const id = fetchIdRef.current;
      fetchNpmSearch(trimmed).then((data) => {
        if (id === fetchIdRef.current) setNpmResults(data);
      });
      debounceRef.current = null;
    }, NPM_SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [currentRootActionId, searchQuery]);

  const baseActions: Action[] = [
    {
      id: INSTALL_NPM_PARENT_ID,
      name: t("CMD_INSTALL_NPM_PACKAGE"),
      section: t("SECTION_DEPENDENCIES"),
      icon: <BiPackage className="size-4 shrink-0" />,
      shortcut: ["$mod+Shift+P"],
      keywords: "install,add,package,npm,dependency,add package,library",
    },
    ...(npmResults?.objects ?? []).map((item) => {
      const pkg = item.package;
      return {
        id: `${INSTALL_NPM_PARENT_ID}-${pkg.name}`,
        name: pkg.name,
        parent: INSTALL_NPM_PARENT_ID,
        subtitle: pkg.description ?? undefined,
        icon: <BiPackage className="size-4 shrink-0" />,
        keywords: [pkg.name, pkg.description ?? ""].filter(Boolean).join(","),
        perform: () => download.addPackage(pkg.name, pkg.version),
      };
    }),
    {
      id: UNINSTALL_NPM_PARENT_ID,
      name: t("CMD_UNINSTALL_NPM_PACKAGE"),
      section: t("SECTION_DEPENDENCIES"),
      icon: <BsTrash className="size-4 shrink-0" />,
      keywords: "uninstall,remove,delete,package,npm,remove package",
    },
    ...Object.entries(packages).map(([pkgName, version]) => ({
      id: `${UNINSTALL_NPM_PARENT_ID}-${pkgName}`,
      name: pkgName,
      parent: UNINSTALL_NPM_PARENT_ID,
      subtitle: version,
      icon: <BsTrash className="size-4 shrink-0" />,
      keywords: pkgName,
      perform: () => download.removePackage(pkgName),
    })),
    {
      id: "settings-theme",
      name: t("CMD_TOGGLE_THEME"),
      section: t("SECTION_APPEARANCE"),
      icon: <BiSolidMoon className="size-4 shrink-0" />,
      keywords: "theme,dark,light,mode,appearance,toggle,night,day",
      perform: () => toggleTheme(),
    },
    {
      id: "font-size-increase",
      name: t("CMD_FONT_SIZE_INCREASE"),
      section: t("SECTION_APPEARANCE"),
      shortcut: ["$mod+ArrowUp"],
      icon: <BsArrowUp className="size-4 shrink-0" />,
      keywords: "font,size,increase,bigger,zoom,scale,text,editor",
      perform: () =>
        changeSize(Math.min(MAX_FONT_SIZE, currentSize + FONT_SIZE_STEP)),
    },
    {
      id: "font-size-decrease",
      name: t("CMD_FONT_SIZE_DECREASE"),
      section: t("SECTION_APPEARANCE"),
      shortcut: ["$mod+ArrowDown"],
      icon: <BsArrowDown className="size-4 shrink-0" />,
      keywords: "font,size,decrease,smaller,zoom,scale,text,editor",
      perform: () =>
        changeSize(Math.max(MIN_FONT_SIZE, currentSize - FONT_SIZE_STEP)),
    },
    {
      id: CHANGE_FONT_PARENT_ID,
      name: t("CMD_CHANGE_FONT"),
      section: t("SECTION_APPEARANCE"),
      icon: <BsType className="size-4 shrink-0" />,
      shortcut: ["$mod+Shift+F"],
      keywords: "font,typeface,typography,change font,editor,letter",
    },
    ...EDITOR_FONTS.map((f) => ({
      id: `${CHANGE_FONT_PARENT_ID}-${f.key.replace(/\s+/g, "-").toLowerCase()}`,
      name: f.name,
      parent: CHANGE_FONT_PARENT_ID,
      icon: <BsType className="size-4 shrink-0" />,
      keywords: `${f.name},${f.key},font,typeface`,
      perform: () => changeFont(f.key),
    })),
    {
      id: CHANGE_LANGUAGE_PARENT_ID,
      name: t("CMD_CHANGE_LANGUAGE"),
      section: t("SECTION_APPEARANCE"),
      icon: <BsGlobe2 className="size-4 shrink-0" />,
      shortcut: ["$mod+Shift+L"],
      keywords: "language,locale,idiom,translate,change language,es,en,idioma",
    },
    ...LOCALES.map((locale) => ({
      id: `${CHANGE_LANGUAGE_PARENT_ID}-${locale.key}`,
      name: t(`LOCALE_${locale.key.toUpperCase()}`),
      parent: CHANGE_LANGUAGE_PARENT_ID,
      icon: (
        <img
          src={`/flags/${locale.flag}`}
          alt=""
          className="size-4 shrink-0 rounded object-cover"
        />
      ),
      keywords: `${locale.key},${t(`LOCALE_${locale.key.toUpperCase()}`)},language,locale`,
      perform: () => i18n.changeLanguage(locale.key),
    })),
  ];

  useRegisterActions(baseActions, [
    t,
    toggleTheme,
    changeFont,
    changeSize,
    currentSize,
    i18n,
    npmResults,
    packages,
    download.addPackage,
    download.removePackage,
  ]);

  return null;
};

export default RegisterCommandPaletteActions;
