import { useCallback, useEffect, useState } from "react";

export const useDropdownAnchor = ({ selectedLevel, nodeRefs, scrollRef }) => {
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [dropdownReady, setDropdownReady] = useState(false);

  const updateDropdownPosition = useCallback(() => {
    if (!selectedLevel) return;

    const node = nodeRefs.current[selectedLevel.id];
    if (!node) return;

    const rect = node.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const bottomY = rect.bottom;

    // Position dropdown
    setDropdownPosition({
      left: centerX,
      top: bottomY + 10,
    });

    // 🔥 THIS is what your deleted effect used to do
    setDropdownReady(true);
  }, [selectedLevel, nodeRefs]);

  useEffect(() => {
    if (!selectedLevel) return;
    setDropdownReady(false);
    // run measurement on next frame (ensures DOM is ready)
    requestAnimationFrame(() => {
      updateDropdownPosition();
    });
  }, [selectedLevel, updateDropdownPosition]);

  useEffect(() => {
    if (!selectedLevel) return;

    const scrollEl = scrollRef.current;

    if (!scrollEl) return;

    scrollEl.addEventListener("scroll", updateDropdownPosition);
    window.addEventListener("resize", updateDropdownPosition);

    // run once immediately
    updateDropdownPosition();

    return () => {
      scrollEl.removeEventListener("scroll", updateDropdownPosition);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [selectedLevel, updateDropdownPosition, scrollRef]);
  return { dropdownPosition, dropdownReady };
};
