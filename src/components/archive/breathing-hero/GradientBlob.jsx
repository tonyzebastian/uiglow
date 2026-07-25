// src/components/backgrounds/GradientBlob.jsx
'use client';
import styles from './GradientBlob.module.css';

const GradientBlob = ({ width, height, children }) => {
  return (
    <div className={styles.container}>
      <div 
        className={styles.blobCont} 
        style={{ 
          width: width || '500px', 
          height: height || '500px',
        }}
      >
        <div className={`${styles.yellow} ${styles.blob}`}></div>
        <div className={`${styles.red} ${styles.blob}`}></div>
        <div className={`${styles.green} ${styles.blob}`}></div>
      </div>
      {children && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  );
};

export default GradientBlob;