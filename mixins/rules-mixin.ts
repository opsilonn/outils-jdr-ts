import { Component, Vue } from 'nuxt-property-decorator';

@Component
export default class RulesMixin extends Vue {
  // Input max values
  valueMaxSmall: number = 100;
  valueMaxBig: number = 65535;

  // Rules
  rules: any = {
    required: (value: any) => !!value || "Required",
    max50: (value: string) => (value !== null && value !== undefined && value.length <= 100) || "Max 100 characters",
    ascii: (value: string) => (value !== null
      && value !== undefined
      && value
        .split("")
        .every((v) => v.charCodeAt(0) >= 32 && v.charCodeAt(0) <= 255))
      || "Contains invalid character",
    nameMatch(name: string) {
      return (value: string) => value === name || "The names do not match !";
    },
    passwordMatch(name: string) {
      return (value: string) => value === name || "The passwords do not match !";
    },
  }
};
