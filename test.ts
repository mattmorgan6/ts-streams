const VCF = require('@gmod/vcf')
const { TabixIndexedFile } = require('@gmod/tabix')

console.log('test')

const tbiIndexed = new TabixIndexedFile({path: './test/test.vcf.gz'})

async function ParseTabixFile(){
    const headerText = await tbiIndexed.getHeader()
    const tbiVCFParser = new VCF({ header: headerText })
    const variants = []
    await tbiIndexed.getLines('ctgA', 200, 300, line =>
      variants.push(tbiVCFParser.parseLine(line)),
    )
    console.log(variants)
}

ParseTabixFile()