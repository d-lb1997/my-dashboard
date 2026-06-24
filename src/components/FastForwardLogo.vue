<template>
  <svg
    class="ff-logo"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect
      x="1"
      y="1"
      width="30"
      height="30"
      rx="9"
      class="ff-logo__frame"
    />
    <path d="M9 16H21" class="ff-logo__track" stroke-width="1.5" stroke-linecap="round" />
    <path
      d="M13 11L19 16L13 21"
      class="ff-logo__chevron"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M17 11L23 16L17 21"
      class="ff-logo__chevron ff-logo__chevron--dim"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<style scoped>
.ff-logo {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.ff-logo__frame {
  fill: rgba(0, 242, 255, 0.06);
  stroke: rgba(0, 242, 255, 0.35);
  stroke-width: 1;
}

.ff-logo__track {
  stroke: rgba(0, 242, 255, 0.35);
}

.ff-logo__chevron {
  stroke: #00f2ff;
}

.ff-logo__chevron--dim {
  stroke: rgba(0, 242, 255, 0.55);
}
</style>
