import React, { useState, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const BalancedDynamicPage = ({ navbarHeight = 64 }) => {
  const theme = useTheme();
  const [activeShape, setActiveShape] = useState(0);

  const shapes = [
    { color: theme.palette.primary.main, size: '40vmin' },
    { color: theme.palette.secondary.main, size: '35vmin' },
    { color: theme.palette.success.main, size: '45vmin' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveShape(prev => (prev + 1) % shapes.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [shapes.length]);

  return (
    <Box
      sx={{
        width: '100vw',
        height: `calc(100vh - ${navbarHeight}px)`,
        position: 'fixed',
        top: `${navbarHeight}px`,
        left: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.background.default,
        zIndex: 1
      }}
    >
      {/* Dinamik Şekiller */}
      <Box
        sx={{
          position: 'relative',
          width: '60vmin',
          height: '60vmin',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence>
          {shapes.map((shape, index) => (
            <motion.div
              key={index}
              style={{
                position: 'absolute',
                width: shape.size,
                height: shape.size,
                backgroundColor: shape.color,
                borderRadius: '30%',
                opacity: 0.6
              }}
              initial={{ scale: 0.5, rotate: -45 }}
              animate={{
                scale: index === activeShape ? 1 : 0.7,
                rotate: index === activeShape ? 0 : 45,
                opacity: index === activeShape ? 0.6 : 0.2
              }}
              exit={{ scale: 0 }}
              transition={{
                duration: 1.5,
                type: 'spring',
                damping: 10
              }}
              whileHover={{
                opacity: 0.8,
                scale: 1.05
              }}
            />
          ))}
        </AnimatePresence>

        {/* Orta Nokta */}
        <motion.div
          style={{
            width: '10vmin',
            height: '10vmin',
            borderRadius: '50%',
            backgroundColor: theme.palette.common.white,
            mixBlendMode: 'overlay'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity
          }}
        />
      </Box>
    </Box>
  );
};

export default BalancedDynamicPage;