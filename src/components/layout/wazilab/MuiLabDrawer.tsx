"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { UjuziLogo } from "@/components/brand/UjuziLogo";
import { usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ScienceIcon from "@mui/icons-material/Science";
import BusinessIcon from "@mui/icons-material/Business";
import FolderIcon from "@mui/icons-material/Folder";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { NAV_WAZILAB, NAV_STUDENT, NAV_INSTRUCTOR, NAV_ADMIN, PLATFORM } from "@/lib/constants";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { DRAWER_COLLAPSED, DRAWER_WIDTH } from "@/theme/wazilab-mui-theme";
import { UJUZI } from "@/lib/ujuzi-brand";

const ICONS = {
  Home: HomeIcon,
  GraduationCap: SchoolIcon,
  Lightbulb: LightbulbIcon,
  BookOpen: MenuBookIcon,
  FlaskConical: ScienceIcon,
  Building2: BusinessIcon,
  FolderKanban: FolderIcon,
  Package: Inventory2Icon,
  Users: PeopleIcon,
  Trophy: EmojiEventsIcon,
  Library: LocalLibraryIcon,
} as const;

function DrawerNavItem({
  href,
  active,
  icon,
  label,
  expanded,
  isDesktop,
  onClick,
  dense,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  isDesktop: boolean;
  onClick?: () => void;
  dense?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const showLabel = expanded || !isDesktop;

  return (
    <ListItemButton
      component={Link}
      href={href}
      selected={active}
      onClick={onClick}
      sx={{
        position: "relative",
        minHeight: dense ? 44 : 48,
        justifyContent: showLabel ? "initial" : "center",
        px: 2,
        overflow: "hidden",
        "&.Mui-selected": { bgcolor: "transparent" },
        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
      }}
    >
      {active &&
        (reduceMotion ? (
          <Box
            sx={{
              position: "absolute",
              inset: "4px 8px",
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 0,
            }}
          />
        ) : (
          <Box
            component={motion.div}
            layoutId="drawer-active-pill"
            sx={{
              position: "absolute",
              inset: "4px 8px",
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 0,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
          />
        ))}
      <ListItemIcon sx={{ justifyContent: "center", zIndex: 1, minWidth: 40 }}>{icon}</ListItemIcon>
      {showLabel && (
        <ListItemText
          primary={label}
          sx={{ zIndex: 1, "& .MuiTypography-root": { fontWeight: active ? 700 : 500 } }}
        />
      )}
    </ListItemButton>
  );
}

const STUDENT_ICONS: Record<string, typeof HomeIcon> = {
  LayoutDashboard: DashboardIcon,
  BookOpen: MenuBookIcon,
  GraduationCap: SchoolIcon,
  FlaskConical: ScienceIcon,
  Trophy: EmojiEventsIcon,
  Users: PeopleIcon,
  FolderOpen: FolderIcon,
  Building2: BusinessIcon,
  Award: EmojiEventsIcon,
  Heart: FavoriteIcon,
  Lightbulb: LightbulbIcon,
  User: SettingsIcon,
  Package: Inventory2Icon,
};

export function MuiLabDrawer({
  mobileOpen,
  onMobileClose,
  onExpandedChange,
  showStudentNav,
  showInstructorNav,
  showAdminNav,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
  showStudentNav?: boolean;
  showInstructorNav?: boolean;
  showAdminNav?: boolean;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const showMyLearning = !!showStudentNav;
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const expanded = pinned || hovered;

  const width = expanded ? DRAWER_WIDTH : DRAWER_COLLAPSED;

  useEffect(() => {
    if (isDesktop) onExpandedChange?.(expanded);
  }, [expanded, isDesktop, onExpandedChange]);

  const drawerContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: isDesktop ? width : DRAWER_WIDTH,
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflowX: "hidden",
        overflowY: "auto",
      }}
      className="ujuzi-scroll-dark"
      onMouseEnter={() => isDesktop && setHovered(true)}
      onMouseLeave={() => isDesktop && setHovered(false)}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: expanded || !isDesktop ? "space-between" : "center",
          minHeight: expanded || !isDesktop ? 64 : 88,
          px: expanded || !isDesktop ? 1 : 0.5,
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Box sx={{ width: expanded || !isDesktop ? "auto" : "100%", px: 1, py: 0.75, overflow: "visible" }}>
          <UjuziLogo
            variant={expanded || !isDesktop ? "full" : "icon"}
            theme="on-dark"
            logoHeight={expanded || !isDesktop ? 64 : 56}
            href="/"
          />
        </Box>
        {isDesktop && expanded && (
          <IconButton
            size="small"
            onClick={() => setPinned(!pinned)}
            sx={{ color: "rgba(255,255,255,0.8)" }}
            aria-label={pinned ? "Collapse" : "Pin open"}
          >
            {pinned ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Box>

      <List sx={{ flex: 1, py: 1 }}>
        {NAV_WAZILAB.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] || HomeIcon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <DrawerNavItem
              key={item.href}
              href={item.href}
              active={active}
              icon={<Icon />}
              label={item.label}
              expanded={expanded}
              isDesktop={isDesktop}
              onClick={onMobileClose}
            />
          );
        })}
      </List>

      {showMyLearning && (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
          {(expanded || !isDesktop) && (
            <Typography variant="caption" sx={{ px: 2, py: 1, color: "rgba(255,255,255,0.5)", display: "block" }}>
              MY LEARNING
            </Typography>
          )}
          <List dense sx={{ py: 0 }}>
            {NAV_STUDENT.map((item) => {
              const Icon = STUDENT_ICONS[item.icon] || DashboardIcon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <DrawerNavItem
                  key={item.href}
                  href={item.href}
                  active={active}
                  icon={<Icon />}
                  label={item.label}
                  expanded={expanded}
                  isDesktop={isDesktop}
                  onClick={onMobileClose}
                  dense
                />
              );
            })}
          </List>
        </>
      )}

      {showInstructorNav && (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
          {(expanded || !isDesktop) && (
            <Typography variant="caption" sx={{ px: 2, py: 1, color: "rgba(255,255,255,0.5)", display: "block" }}>
              INSTRUCTOR
            </Typography>
          )}
          <List dense sx={{ py: 0 }}>
            {NAV_INSTRUCTOR.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <DrawerNavItem
                  key={item.href}
                  href={item.href}
                  active={active}
                  icon={<SchoolIcon />}
                  label={item.label}
                  expanded={expanded}
                  isDesktop={isDesktop}
                  onClick={onMobileClose}
                  dense
                />
              );
            })}
          </List>
        </>
      )}

      {showAdminNav && (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
          {(expanded || !isDesktop) && (
            <Typography variant="caption" sx={{ px: 2, py: 1, color: "rgba(255,255,255,0.5)", display: "block" }}>
              ADMIN
            </Typography>
          )}
          <List dense sx={{ py: 0 }}>
            {NAV_ADMIN.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <DrawerNavItem
                  key={item.href}
                  href={item.href}
                  active={active}
                  icon={<AdminPanelSettingsIcon />}
                  label={item.label}
                  expanded={expanded}
                  isDesktop={isDesktop}
                  onClick={onMobileClose}
                  dense
                />
              );
            })}
          </List>
        </>
      )}

      {(expanded || !isDesktop) && (
        <>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
          <Box sx={{ p: 2 }}>
            <Link
              href="/dashboard/resources"
              style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}
            >
              {PLATFORM.name} Resources
            </Link>
          </Box>
        </>
      )}
    </Box>
  );

  if (!isDesktop) {
    return (
      <Drawer
        variant="temporary"
        open={!!mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        className="LabDrawer"
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            backgroundColor: UJUZI.sidebar,
            color: "#fff",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      className="LabDrawer"
      sx={{
        width: DRAWER_COLLAPSED,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
