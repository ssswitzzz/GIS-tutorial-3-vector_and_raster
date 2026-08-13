from manim import *

PAPER_BG = "#f7f1e5"
INK_COLOR = "#26352f"
BLUE_COLOR = "#356b78"
AMBER_COLOR = "#b37a42"
SAGE_COLOR = "#52745f"
CLAY_COLOR = "#995b49"

config.background_color = PAPER_BG
config.frame_width = 16
config.frame_height = 9

class RasterQueryScene(Scene):
    def construct(self):
        title = Text("像元矩阵与 O(1) 空间位置查询", font="Microsoft YaHei", color=INK_COLOR).scale(0.8)
        title.to_edge(UP, buff=0.5)

        matrix_vals = [
            [12, 24, 35, 48],
            [18, 42, 68, 55],
            [30, 51, 89, 72],
            [22, 38, 64, 41]
        ]
        
        grid = IntegerTable(
            matrix_vals,
            row_labels=[Text(f"行{i}", font="Microsoft YaHei", color=BLUE_COLOR).scale(0.5) for i in range(4)],
            col_labels=[Text(f"列{j}", font="Microsoft YaHei", color=BLUE_COLOR).scale(0.5) for j in range(4)],
            v_buff=0.6,
            h_buff=0.8,
            line_config={"stroke_color": BLUE_COLOR, "stroke_width": 2}
        ).scale(0.8).shift(LEFT * 2.5)

        for entry in grid.get_entries():
            entry.set_color(INK_COLOR)

        self.play(Write(title))
        self.play(Create(grid), run_time=1.5)

        target_cell = grid.get_entries()[1 * 4 + 2]
        rect = SurroundingRectangle(target_cell, color=AMBER_COLOR, stroke_width=4, buff=0.15)
        target_text = Text("目标像元: 行1, 列2 (值=68)", font="Microsoft YaHei", color=AMBER_COLOR).scale(0.6)
        target_text.next_to(grid, RIGHT, buff=1.2).shift(UP * 1)

        formula = MathTex(
            r"\text{Pos} = \text{Origin} + (c \cdot \Delta s, -r \cdot \Delta s)",
            color=BLUE_COLOR
        ).scale(0.7).next_to(target_text, DOWN, buff=0.5)

        complexity = Text("时间复杂度: O(1)", font="Microsoft YaHei", weight=BOLD, color=AMBER_COLOR).scale(0.7)
        complexity.next_to(formula, DOWN, buff=0.5)

        self.play(Create(rect), Write(target_text), run_time=1)
        self.play(Write(formula), run_time=1)
        self.play(FadeIn(complexity, shift=UP * 0.2), run_time=1)
        self.wait(1)


class LayerAlgebraScene(Scene):
    def construct(self):
        title = Text("图层矩阵代数与波段计算", font="Microsoft YaHei", color=INK_COLOR).scale(0.8)
        title.to_edge(UP, buff=0.5)

        mA = Matrix([[10, 20], [30, 40]], element_to_mobject_config={"color": SAGE_COLOR}).scale(0.9)
        plus = MathTex("+", color=AMBER_COLOR, font_size=60)
        mB = Matrix([[5, 8], [12, 15]], element_to_mobject_config={"color": BLUE_COLOR}).scale(0.9)
        eq = MathTex("=", color=AMBER_COLOR, font_size=60)
        mC = Matrix([[15, 28], [42, 55]], element_to_mobject_config={"color": AMBER_COLOR}).scale(0.9)

        group = VGroup(mA, plus, mB, eq, mC).arrange(RIGHT, buff=0.5).shift(UP * 0.5)

        lblA = Text("高程图层 A", font="Microsoft YaHei", color=SAGE_COLOR).scale(0.5).next_to(mA, DOWN)
        lblB = Text("降雨图层 B", font="Microsoft YaHei", color=BLUE_COLOR).scale(0.5).next_to(mB, DOWN)
        lblC = Text("叠加结果 C", font="Microsoft YaHei", color=AMBER_COLOR).scale(0.5).next_to(mC, DOWN)

        desc = Text("像元位置完全重合 $\rightarrow$ 逐像素算术与逻辑运算极速完成", font="Microsoft YaHei", color=INK_COLOR).scale(0.6)
        desc.to_edge(DOWN, buff=1)

        self.play(Write(title))
        self.play(FadeIn(mA), FadeIn(lblA), run_time=1)
        self.play(FadeIn(plus), FadeIn(mB), FadeIn(lblB), run_time=1)
        self.play(FadeIn(eq), FadeIn(mC), FadeIn(lblC), run_time=1)
        self.play(Write(desc), run_time=1)
        self.wait(1)


class SquareGrowthScene(Scene):
    def construct(self):
        title = Text("分辨率提升与 O(N²) 数据量平方级增长", font="Microsoft YaHei", color=INK_COLOR).scale(0.8)
        title.to_edge(UP, buff=0.5)

        axes = Axes(
            x_range=[1, 4, 1],
            y_range=[1, 16, 4],
            x_length=6,
            y_length=4,
            axis_config={"color": INK_COLOR},
            tips=False
        ).shift(LEFT * 2)

        x_lbl = Text("分辨率倍率 (s)", font="Microsoft YaHei", color=INK_COLOR).scale(0.5).next_to(axes.x_axis, DOWN)
        y_lbl = Text("数据量 (N²)", font="Microsoft YaHei", color=AMBER_COLOR).scale(0.5).next_to(axes.y_axis, UP)

        graph = axes.plot(lambda x: x**2, color=AMBER_COLOR, x_range=[1, 4])
        graph_label = MathTex("y = s^2", color=AMBER_COLOR).next_to(graph, UP)

        card = Rectangle(width=5, height=3.5, color=CLAY_COLOR, fill_color=PAPER_BG, fill_opacity=1).shift(RIGHT * 3.5)
        card_title = Text("GeoTIFF 存储告急 ⚠️", font="Microsoft YaHei", color=CLAY_COLOR).scale(0.6).shift(RIGHT * 3.5 + UP * 1)
        card_text1 = Text("边长缩小 1/2", font="Microsoft YaHei", color=INK_COLOR).scale(0.5).next_to(card_title, DOWN, buff=0.3)
        card_text2 = Text("数据像元数 ➔ 4 倍", font="Microsoft YaHei", color=AMBER_COLOR, weight=BOLD).scale(0.6).next_to(card_text1, DOWN, buff=0.3)

        self.play(Write(title))
        self.play(Create(axes), Write(x_lbl), Write(y_lbl), run_time=1.5)
        self.play(Create(graph), Write(graph_label), run_time=1.5)
        self.play(Create(card), Write(card_title), Write(card_text1), Write(card_text2), run_time=1.5)
        self.wait(1)
