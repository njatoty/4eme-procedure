const { mergeDataWithKey } = require("../methods/methods");

describe('Merge First Data with key', () => {

    it('shoud return array with value that contains property heure_suppl not null', () => {

        const data1 = [
            {
                nom: 'USER1',
                m_code: 'M-CODE1',
                total_maj_nuit: '-',
                total_maj_weekend: '-',
                total_maj_ferie: '-',
            },
        ];

        const data2 = [
            {
                m_code: 'M-CODE1',
                total_maj_nuit: 25,
                total_maj_ferie: 18,
            }
        ];

        expect(mergeDataWithKey(data1, data2, 'm_code')).toEqual(expect.arrayContaining([
            expect.objectContaining({ total_maj_nuit: 25 }),
            expect.objectContaining({ total_maj_ferie: 18 }),
        ]))

    })
})