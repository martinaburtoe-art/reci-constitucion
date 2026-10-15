import { motion } from "framer-motion";

/** Reci, la mascota: una hojita sonriente. */
export function Reci({ size = 96, message }: { size?: number; message?: string }) {
  return (
    <div className="flex items-end gap-3">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        animate={{ y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        aria-label="Reci"
      >
        <path d="M50 8 C82 18 92 52 72 78 C60 92 40 92 28 78 C8 52 18 18 50 8Z" fill="var(--leaf)" />
        <path d="M50 20 L50 86" stroke="var(--leaf-dark)" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="50" r="5" fill="var(--foreground)" />
        <circle cx="60" cy="50" r="5" fill="var(--foreground)" />
        <path d="M40 62 Q50 72 60 62" stroke="var(--foreground)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </motion.svg>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 max-w-[16rem] rounded-2xl rounded-bl-none bg-card p-3 text-sm shadow-soft"
        >
          {message}
        </motion.div>
      )}
    </div>
  );
}
