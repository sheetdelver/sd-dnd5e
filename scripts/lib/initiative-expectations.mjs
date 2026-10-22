/** Independent numeric oracle for the pinned initiative formula's three ordered
 * operands: retained face, earlier integer modifier, current integer score/100.
 * Preserve native IEEE addition order; never regroup or round host serialization.
 * Test-only arithmetic, not a formula parser or dice evaluator. */
export function initiativeRollExpectedTotal(face,modifier,currentScore) {
    return (face+modifier)+(currentScore/100);
}
