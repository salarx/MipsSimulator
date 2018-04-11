# MIPS Simulator

## Supported MIPS Instructions
- [Add - add (with overflow)](#add---add-with-overflow)
- [Addi - add immediate (with overflow)](#addi---add-immediate-with-overflow)
- [Sub - subtract](#sub---subtract)
- [Slt - set on less than (signed)](#slt---set-on-less-than-signed)
- [Lw - load word](#lw---load-word)
- [Sw - store word](#sw---store-word)
- [Beq - branch on equal](#beq---branch-on-equal)
- [Bne - branch on not equal](#beq---branch-on-not-equal)

### Add - add (with overflow)
add rd, rs, rt  
rd = rs + rt  
0000 00ss ssst tttt dddd d000 0010 0000

### Addi - add immediate (with overflow)
addi rs, rt, imm  
rt = rs + imm  
0010 00ss ssst tttt iiii iiii iiii iiii

### Sub - subtract
sub rd, rs, rt  
rd = rs - rt  
0000 00ss ssst tttt dddd d000 0010 0010

### Slt - set on less than (signed)
slt rd, rs, rt  
if(rs < rt) rd = 1 else rd = 0  
0000 00ss ssst tttt dddd d000 0010 1010 

### Lw - load word
lw rt, offset(rs)  
rt = &ast;(int&ast;)(offset+rs)  
1000 11ss ssst tttt iiii iiii iiii iiii

### Sw - store word
sw rt, offset(rs)  
&ast;(int&ast;)(offset+rs) = rt  
1010 11ss ssst tttt iiii iiii iiii iiii

### Beq - branch on equal
beq rs, rt, offset  
if(rs == rt) pc += offset * 4  
0001 00ss ssst tttt iiii iiii iiii iiii

### Bne - branch on not equal
bne rs, rt, offset  
if(rs != rt) pc += offset * 4  
0001 01ss ssst tttt iiii iiii iiii iiii  

