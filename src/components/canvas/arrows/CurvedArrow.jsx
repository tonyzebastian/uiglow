export default function CurvedArrow({ direction = 'down-left', width = 100, height = 100 }) {
  const arrows = {
    'down-left': (
      <svg viewBox="0 0 850 512" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M833.878 15C833.878 87.0442 836.942 156.636 812.378 225.322C787.323 295.381 726.524 354.053 666.954 395.313C571.255 461.597 445.966 445.205 335.196 445.205C233.419 445.205 133.988 440.298 33 429.072" stroke="currentColor" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M51.1611 497C45.189 481.044 34.4507 466.948 26.7904 451.76C22.9218 444.09 19.0795 436.027 16.4328 427.807C13.5774 418.939 14.6198 415.252 22.9473 410.544C38.4828 401.76 55.8277 395.582 72.0169 388.041C74.3181 386.969 76.6437 385.941 79 385" stroke="currentColor" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'down-right': (
      <svg viewBox="0 0 742 577" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M37.2886 15.4346C36.2217 67.9279 39.0561 121.09 44.3176 173.284C53.7724 267.075 68.5593 381.206 161.659 430.222C281.715 493.431 437.409 499.132 570.04 502.448C614.507 503.559 660.625 502.822 704.435 493.516" stroke="currentColor" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M685.457 561.36C692.465 545.492 704.24 531.784 712.93 516.792C717.319 509.221 721.703 501.249 724.873 493.05C728.294 484.204 727.438 480.399 719.192 475.142C703.809 465.334 686.429 458.07 670.308 449.487C668.016 448.267 665.697 447.09 663.342 446" stroke="currentColor" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'up-left': (
      <svg viewBox="0 0 855 517" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M838.878 502C838.878 429.956 841.942 360.364 817.378 291.678C792.323 221.619 731.524 162.947 671.954 121.687C576.255 55.4028 450.966 71.7952 340.196 71.7952C238.419 71.7952 138.988 76.7016 38 87.9279" stroke="currentColor" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M53.4212 15C47.0758 31.8106 35.6663 46.6618 27.5273 62.6633C23.4169 70.7444 19.3345 79.2399 16.5224 87.8997C13.4885 97.2427 14.5961 101.127 23.444 106.088C39.9505 115.342 58.3795 121.851 75.5804 129.796C78.0255 130.926 80.4964 132.009 83 133" stroke="currentColor" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    'spec-left': (
      <svg viewBox="0 0 1282 547" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1267 15C1222.05 16.926 1172.95 37.0566 1130.3 51.8763C1080.91 69.0343 1039 83.4244 1006.02 126.431C980.707 159.442 968.128 188.771 971.543 231.448C975.59 282.033 1009.11 326.778 1015.24 376.949C1021.06 424.526 1021.46 464.036 985.173 498.801C928.781 552.835 830.709 527.177 763.28 516.438C639.461 496.717 516.163 473.76 392.455 453.307C293.811 436.998 198.237 419.036 98 419.036" stroke="currentColor" strokeWidth="30" strokeLinecap="round"/>
        <path d="M105.787 346.787C118.2 329.265 118.758 335.871 105.787 346.987C83.9687 365.686 54.2417 373.163 32.3714 391.791C11.7474 409.357 7.32849 423.084 30.9711 439.594C74.5779 470.046 126.863 478.955 167 516" stroke="currentColor" strokeWidth="30" strokeLinecap="round"/>
      </svg>
    ),
    'spec-right': (
      <svg viewBox="0 0 1282 547" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 15C59.9481 16.926 109.045 37.0566 151.704 51.8763C201.093 69.0343 243.004 83.4244 275.98 126.431C301.293 159.442 313.872 188.771 310.457 231.448C306.41 282.033 272.893 326.778 266.76 376.949C260.944 424.526 260.544 464.036 296.827 498.801C353.219 552.835 451.291 527.177 518.72 516.438C642.539 496.717 765.837 473.76 889.545 453.307C988.189 436.998 1083.76 419.036 1184 419.036" stroke="currentColor" strokeWidth="30" strokeLinecap="round"/>
        <path d="M1176.21 346.787C1163.8 329.265 1163.24 335.871 1176.21 346.987C1198.03 365.686 1227.76 373.163 1249.63 391.791C1270.25 409.357 1274.67 423.084 1251.03 439.594C1207.42 470.046 1155.14 478.955 1115 516" stroke="currentColor" strokeWidth="30" strokeLinecap="round"/>
      </svg>
    ),
    'spec2-left': (
      <svg viewBox="0 0 400 456" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M253.691 15C268.79 50.7259 296.244 79.4132 319.575 109.878C342.908 140.346 364.36 174.569 376.408 211.28C396.769 273.324 380.299 333.468 333.82 379.393C285.842 426.799 191.111 452.074 125.781 436.32C95.9299 429.121 39.0203 404.973 32 369.905" stroke="currentColor" strokeWidth="30" strokeLinecap="round"/>
        <path d="M20.6556 361.016C11.8706 359.918 15.9422 416.515 15.9422 422.291" stroke="currentColor" strokeWidth="30" strokeLinecap="round"/>
        <path d="M17 367C17.6454 361.22 22.9769 358.895 28.3095 359.004C49.2768 359.429 71.0348 364.914 92 367" stroke="currentColor" strokeWidth="30" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div className="text-slate-300 dark:text-slate-700" style={{ width, height }}>
      {arrows[direction] || arrows['down-left']}
    </div>
  );
}
